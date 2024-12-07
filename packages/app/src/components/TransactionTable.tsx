'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Transaction {
  id: string
  chain: string
  description: string
  txHash: string
}

export default function TransactionTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // This function would be called when a transaction is made
  const addTransaction = (chain: string, description: string, txHash: string) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      chain,
      description,
      txHash,
    }
    setTransactions((prev) => [newTransaction, ...prev])
  }

  // For demonstration purposes, let's add a sample transaction
  if (transactions.length === 0) {
    addTransaction('Ethereum', 'Airdrop Claim', '0x123...abc')
  }

  return (
    <div className='bg-white rounded-xl shadow-2xl p-8'>
      <h2 className='text-2xl font-bold mb-4 text-gray-800'>Transaction History</h2>
      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Chain</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Transaction Hash</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>{tx.chain}</TableCell>
                <TableCell>{tx.description}</TableCell>
                <TableCell>
                  <a
                    href={`https://etherscan.io/tx/${tx.txHash}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 hover:underline'>
                    {tx.txHash.slice(0, 6)}...{tx.txHash.slice(-4)}
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
