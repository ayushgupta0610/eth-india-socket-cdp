import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Transaction } from '@/types/transaction'

interface TransactionTableProps {
  transactions: Transaction[]
}

const formatChainName = (chain: string): string => {
  switch (chain.toLowerCase()) {
    case 'basesepolia':
      return 'Base Sepolia'
    case 'arbitrumsepolia':
      return 'Arbitrum Sepolia'
    case 'optimismsepolia':
      return 'Optimism Sepolia'
    default:
      return chain
  }
}

const formatDescription = (description: string): string => {
  return description.replace(/(baseSepolia|arbitrumSepolia|optimismSepolia)/g, (match) => {
    switch (match.toLowerCase()) {
      case 'basesepolia':
        return 'Base Sepolia'
      case 'arbitrumsepolia':
        return 'Arbitrum Sepolia'
      case 'optimismsepolia':
        return 'Optimism Sepolia'
      default:
        return match
    }
  })
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
                <TableCell>{formatChainName(tx.chain)}</TableCell>
                <TableCell>{formatDescription(tx.description)}</TableCell>
                <TableCell>
                  <a
                    href={`https://explorer-socket-composer-testnet.t.conduit.xyz/tx/${tx.txHash}`}
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
