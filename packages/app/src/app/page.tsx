import WalletConnect from '@/components/WalletConnect'

export default function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500'>
      <div className='w-full max-w-md p-8 bg-white rounded-xl shadow-2xl'>
        <h1 className='text-3xl font-bold text-center mb-8 text-gray-800'>Coinbase Wallet Airdrop</h1>
        <WalletConnect />
      </div>
    </main>
  )
}
