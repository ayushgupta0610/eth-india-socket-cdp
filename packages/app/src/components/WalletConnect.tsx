'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk'
import { getGasRecommendation } from '@/lib/gasCheck'

export default function WalletConnect() {
  const [wallet, setWallet] = useState<any>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [recommendation, setRecommendation] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGasInfo = async () => {
      try {
        const rec = await getGasRecommendation()
        console.log('gas recommendation: ', rec)
        setRecommendation(rec)
      } catch (error) {
        console.error('Failed to fetch gas info:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGasInfo()
    // Refresh every 10 seconds
    const interval = setInterval(fetchGasInfo, 10000)
    return () => clearInterval(interval)
  }, [])

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
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulating a delay
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
          <pre style={{ whiteSpace: 'pre-wrap' }}>{recommendation}</pre>
        </div>
      )}
    </div>
  )
}
