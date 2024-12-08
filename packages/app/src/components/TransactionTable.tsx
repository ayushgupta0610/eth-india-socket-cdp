import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Transaction } from '@/types/transaction'

interface TransactionTableProps {
  transactions: Transaction[]
}

export default function TransactionTable({ transactions }: TransactionTableProps) {
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
