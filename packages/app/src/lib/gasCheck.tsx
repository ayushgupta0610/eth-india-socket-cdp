import { createPublicClient, http, formatGwei, Chain } from 'viem'
import { optimismSepolia, baseSepolia, arbitrumSepolia } from 'viem/chains'

interface GasPrice {
  chain: Chain
  baseFee: bigint
  formattedPrice: string
}

export const checkOptimalGasChain = async (): Promise<{
  optimalChain: Chain
  gasPrices: GasPrice[]
}> => {
  // Initialize clients for each chain
  const clients = {
    optimism: createPublicClient({
      chain: optimismSepolia,
      transport: http(),
    }),
    base: createPublicClient({
      chain: baseSepolia,
      transport: http(),
    }),
    arbitrum: createPublicClient({
      chain: arbitrumSepolia,
      transport: http(),
    }),
  }

  try {
    // Fetch base fee for each chain
    let [optimismFee, baseFee, arbitrumFee] = await Promise.all([
      clients.optimism.getBlock({ blockTag: 'latest' }).then((block) => block.baseFeePerGas!),
      clients.base.getBlock({ blockTag: 'latest' }).then((block) => block.baseFeePerGas!),
      clients.arbitrum.getBlock({ blockTag: 'latest' }).then((block) => block.baseFeePerGas!),
    ])

    // Base Sepolia wins in gas war
    // optimismFee = BigInt(optimismFee) * BigInt(1000000)
    // arbitrumFee = BigInt(arbitrumFee) * BigInt(1000000)

    // Arbitrum wins in gas war
    // optimismFee = BigInt(optimismFee) * BigInt(1000000)
    // baseFee = BigInt(baseFee) * BigInt(1000000)

    // Optimism wins in gas war
    // arbitrumFee = BigInt(arbitrumFee) * BigInt(1000000)
    // baseFee = BigInt(baseFee) * BigInt(1000000)

    const gasPrices: GasPrice[] = [
      { chain: optimismSepolia, baseFee: optimismFee, formattedPrice: formatGwei(optimismFee) },
      { chain: baseSepolia, baseFee: baseFee, formattedPrice: formatGwei(baseFee) },
      { chain: arbitrumSepolia, baseFee: arbitrumFee, formattedPrice: formatGwei(arbitrumFee) },
    ]

    // Sort by base fee and get the cheapest chain
    const sortedPrices = [...gasPrices].sort((a, b) => Number(a.baseFee - b.baseFee))

    return {
      optimalChain: sortedPrices[0].chain,
      gasPrices: sortedPrices,
    }
  } catch (error) {
    console.error('Error fetching gas prices:', error)
    throw error
  }
}
// Helper function to get a human-readable recommendation
export const getGasRecommendation = async (): Promise<{ name: string; recommendation: string }> => {
  const { optimalChain, gasPrices } = await checkOptimalGasChain()

  const recommendation = `
    🌟 Recommended chain: ${optimalChain.name}
    
    Current gas prices:
    ${gasPrices.map(({ chain, formattedPrice }) => `${chain.name}: ${formattedPrice} Gwei`).join('\n    ')}
  `

  return { name: optimalChain.name, recommendation }
}
