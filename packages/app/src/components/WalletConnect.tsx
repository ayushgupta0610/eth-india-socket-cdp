'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk'

export default function WalletConnect() {
  const [wallet, setWallet] = useState<any>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)

  useEffect(() => {
    const coinbaseWallet = new CoinbaseWalletSDK({
      appName: 'Coinbase Wallet Airdrop',
    })
    setWallet(coinbaseWallet)
  }, [])

  const connectWallet = async () => {
    if (!wallet) return
    setIsConnecting(true)
    try {
      const ethereum = await wallet.makeWeb3Provider()
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      setAddress(accounts[0])
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
    setIsConnecting(false)
  }

  const claimAirdrop = async () => {
    if (!address) return
    setIsClaiming(true)
    // Implement your airdrop claiming logic here
    await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulating a delay
    alert('Airdrop claimed successfully!')
    setIsClaiming(false)
  }

  return (
    <div className='space-y-6'>
      {!address ? (
        <Button onClick={connectWallet} disabled={isConnecting} className='w-full'>
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      ) : (
        <div className='space-y-4'>
          <p className='text-sm text-center text-gray-600'>
            Connected: {address.slice(0, 6)}...{address.slice(-4)}
          </p>
          <Button onClick={claimAirdrop} disabled={isClaiming} className='w-full'>
            {isClaiming ? 'Claiming...' : 'Claim Airdrop'}
          </Button>
        </div>
      )}
    </div>
  )
}
