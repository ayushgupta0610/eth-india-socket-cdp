'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk'
import { Transaction } from '@/types/transaction'
import { createWalletClient, custom, parseAbi, createPublicClient, http, getContract } from 'viem'
import { claimAirdropAbi } from '../abis'
import { getGasRecommendation } from '../lib/gasCheck'

interface WalletConnectProps {
  addTransaction: (transaction: Transaction) => void
}

export default function WalletConnect({ addTransaction }: WalletConnectProps) {
  const [wallet, setWallet] = useState<any>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [gasText, setGasText] = useState<string>('')
  const [recommendation, setRecommendation] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [claimingStates, setClaimingStates] = useState({
    baseSepolia: false,
    optimismSepolia: false,
    arbitrumSepolia: false,
  })

  const CHAIN_EXPLORERS = {
    baseSepolia: 'https://sepolia.basescan.org',
    optimismSepolia: 'https://sepolia-optimism.etherscan.io',
    arbitrumSepolia: 'https://sepolia.arbiscan.io',
  }

  useEffect(() => {
    const fetchGasInfo = async () => {
      try {
        const gas = await getGasRecommendation()
        console.log('gas recommendation: ', gas.name)
        setGasText(gas.recommendation)
        setRecommendation(gas.name)
      } catch (error) {
        console.error('Failed to fetch gas info:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGasInfo()
    // Refresh every 2 seconds
    const interval = setInterval(fetchGasInfo, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const coinbaseWallet = new CoinbaseWalletSDK({
      appName: 'Chain Abstracted Airdrop',
    })
    setWallet(coinbaseWallet)
  }, [])

  const connectWallet = async (walletType: 'coinbase' | 'metamask') => {
    setIsConnecting(true)
    try {
      let ethereum
      if (walletType === 'coinbase') {
        ethereum = await wallet.makeWeb3Provider()
      } else {
        // For MetaMask or other browser wallets
        if (typeof (window as any).ethereum !== 'undefined') {
          ethereum = (window as any).ethereum
        } else {
          throw new Error('MetaMask is not installed')
        }
      }
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      console.log('account: ', accounts[0])
      setAddress(accounts[0])
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
    setIsConnecting(false)
  }

  const disconnectWallet = async () => {
    if (!wallet) return
    try {
      const ethereum = wallet.makeWeb3Provider()
      await ethereum.request({ method: 'eth_accounts', params: [] }) // This is a placeholder; actual disconnect logic may vary
      setAddress(null)
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }

  const claimAirdrop = async (chain: string) => {
    if (!address) return

    // Update specific chain claiming state
    setClaimingStates((prev) => ({
      ...prev,
      [chain]: true,
    }))

    try {
      // Only proceed with network switching for MetaMask
      const ethereum = (window as any).ethereum
      if (!ethereum?.isMetaMask) {
        throw new Error('Please use MetaMask for this transaction')
      }

      // Socket composer testnet configuration
      const socketChain = {
        id: 7625382,
        network: 'socket-composer-testnet',
        name: 'Socket Composer Testnet',
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: ['https://rpc-socket-composer-testnet.t.conduit.xyz'],
          },
        },
        blockExplorers: {
          default: {
            name: 'Socket Explorer',
            url: 'https://explorer-socket-composer-testnet.t.conduit.xyz',
          },
        },
      }

      // Switch network only for MetaMask
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${socketChain.id.toString(16)}` }],
        })
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${socketChain.id.toString(16)}`,
                chainName: socketChain.name,
                nativeCurrency: socketChain.nativeCurrency,
                rpcUrls: socketChain.rpcUrls.default.http,
                blockExplorerUrls: [socketChain.blockExplorers.default.url],
              },
            ],
          })
        } else {
          throw switchError
        }
      }

      const walletClient = createWalletClient({
        account: address as `0x${string}`,
        chain: socketChain,
        transport: custom(ethereum),
      })

      // Token forwarder addresses for each chain
      const tokenGateway = '0x42500d1Ea986a5B636349Ec6B01e593348885EaE'
      const forwarderAddresses = {
        arbitrumSepolia: '0xf5Fb5d5E88f353e80A88c10be086fec39BB66273',
        optimismSepolia: '0x11d0C6C4bAF73d7CF256A7800C0286cC45F2B797',
        baseSepolia: '0x3d10029b64B27b95df188C71639b446E2172D3BF',
      }

      const forwarderAddress = forwarderAddresses[chain as keyof typeof forwarderAddresses]
      if (!forwarderAddress) throw new Error('Invalid chain selected')

      const contract = getContract({
        address: tokenGateway as `0x${string}`,
        abi: claimAirdropAbi,
        client: { public: walletClient, wallet: walletClient },
      })

      const hash = await contract.write.claimAirdrop([forwarderAddress as `0x${string}`], {
        account: address as `0x${string}`,
        chain: socketChain,
      })
      // const receipt = await walletClient.waitForTransactionReceipt({ hash })
      // console.log('receipt: ', receipt)

      const newTransaction: Transaction = {
        id: hash,
        chain: chain,
        description: `Airdrop Claim on ${chain}`,
        txHash: hash,
        explorerUrl: `${CHAIN_EXPLORERS[chain as keyof typeof CHAIN_EXPLORERS]}/tx/${hash}`,
      }

      addTransaction(newTransaction)
    } catch (error: any) {
      console.error('Failed to claim airdrop:', error)
      throw error
    } finally {
      // Reset specific chain claiming state
      setClaimingStates((prev) => ({
        ...prev,
        [chain]: false,
      }))
    }
  }

  return (
    <div className='space-y-6'>
      {!address ? (
        <div className='w-full'>
          <Button onClick={() => connectWallet('metamask')} disabled={isConnecting} className='w-full'>
            {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
          </Button>
        </div>
      ) : (
        <div className='space-y-4'>
          <p className='text-sm text-center text-gray-600'>
            Connected:{' '}
            <a
              href={`https://explorer-socket-composer-testnet.t.conduit.xyz/address/${address}`}
              target='_blank'
              rel='noopener noreferrer'>
              {/* {address.slice(0, 6)}...{address.slice(-4)} */}
              {address}
            </a>
          </p>
          <div className='flex flex-wrap justify-between'>
            <Button
              onClick={() => claimAirdrop('baseSepolia')}
              disabled={Object.values(claimingStates).some(Boolean)}
              className='w-full sm:w-auto'>
              {claimingStates.baseSepolia ? 'Claiming...' : 'Claim on Base'}
            </Button>
            <Button
              onClick={() => claimAirdrop('optimismSepolia')}
              disabled={Object.values(claimingStates).some(Boolean)}
              className='w-full sm:w-auto'>
              {claimingStates.optimismSepolia ? 'Claiming...' : 'Claim on Optimism'}
            </Button>
            <Button
              onClick={() => claimAirdrop('arbitrumSepolia')}
              disabled={Object.values(claimingStates).some(Boolean)}
              className='w-full sm:w-auto'>
              {claimingStates.arbitrumSepolia ? 'Claiming...' : 'Claim on Arbitrum'}
            </Button>
          </div>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{gasText}</pre>
        </div>
      )}
    </div>
  )
}
