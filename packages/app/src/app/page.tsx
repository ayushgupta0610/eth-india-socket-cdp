'use client'

import { useState } from 'react'
import WalletConnect from '@/components/WalletConnect'
import TransactionTable from '@/components/TransactionTable'
import { Transaction } from '@/types/transaction'

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const addTransaction = (newTransaction: Transaction) => {
    setTransactions((prev) => [newTransaction, ...prev])
  }

  return (
    <main className='flex min-h-screen p-4 md:p-24 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500'>
      <div className='w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8'>
        <div className='w-full md:w-1/2'>
          <div className='bg-white rounded-xl shadow-2xl p-8'>
            <h1 className='text-3xl font-bold text-center mb-8 text-gray-800'>Chain Abstracted Airdrop</h1>
            <WalletConnect addTransaction={addTransaction} />
          </div>
        </div>
        <div className='w-full md:w-1/2'>
          <TransactionTable transactions={transactions} />
        </div>
      </div>
    </main>
  )
}
