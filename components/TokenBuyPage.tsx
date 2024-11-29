"use client"

import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect, useBalance, useContractWrite, useWaitForTransaction } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { parseUnits, formatUnits } from 'viem'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Rocket, Coins, TrendingUp, Lock, Zap } from 'lucide-react'

// Replace with your actual token contract address and ABI
const TOKEN_CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890'
const TOKEN_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      }
    ],
    "name": "buyWithUSDT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      }
    ],
    "name": "buyWithBNB",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
]

// Replace with the wallet address to receive the USDT/BNB
const RECEIVER_WALLET = '0x0987654321098765432109876543210987654321'

export default function TokenBuyPage() {
  const [usdtAmount, setUsdtAmount] = useState('')
  const [bnbAmount, setBnbAmount] = useState('')
  const [tokenAmount, setTokenAmount] = useState('')
  const [activeTab, setActiveTab] = useState('usdt')
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  const { address, isConnected } = useAccount()
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  })
  const { disconnect } = useDisconnect()

  const { data: usdtBalance } = useBalance({
    address,
    token: '0x55d398326f99059fF775485246999027B3197955', // USDT contract address on BSC
  })

  const { data: bnbBalance } = useBalance({
    address,
  })

  const { write: buyWithUSDT, data: usdtTxData } = useContractWrite({
    address: TOKEN_CONTRACT_ADDRESS,
    abi: TOKEN_ABI,
    functionName: 'buyWithUSDT',
  })

  const { write: buyWithBNB, data: bnbTxData } = useContractWrite({
    address: TOKEN_CONTRACT_ADDRESS,
    abi: TOKEN_ABI,
    functionName: 'buyWithBNB',
  })

  const { isLoading: isUsdtTxLoading, isSuccess: isUsdtTxSuccess } = useWaitForTransaction({
    hash: usdtTxData?.hash,
  })

  const { isLoading: isBnbTxLoading, isSuccess: isBnbTxSuccess } = useWaitForTransaction({
    hash: bnbTxData?.hash,
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (isUsdtTxSuccess || isBnbTxSuccess) {
      const txHash = isUsdtTxSuccess ? usdtTxData?.hash : bnbTxData?.hash
      toast.success(
        <div>
          Purchase successful!{' '}
          <a href={`https://bscscan.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="underline">
            View transaction
          </a>
        </div>
      )
    }
  }, [isUsdtTxSuccess, isBnbTxSuccess, usdtTxData, bnbTxData])

  const handleUsdtAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsdtAmount(e.target.value)
    setTokenAmount((parseFloat(e.target.value) * 10).toString())
  }

  const handleBnbAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBnbAmount(e.target.value)
    setTokenAmount((parseFloat(e.target.value) * 100).toString())
  }

  const handleBuyWithUSDT = () => {
    if (!usdtBalance || parseFloat(usdtAmount) > parseFloat(formatUnits(usdtBalance.value, usdtBalance.decimals))) {
      toast.error('Insufficient USDT balance')
      return
    }

    buyWithUSDT({
      args: [parseUnits(usdtAmount, 18), RECEIVER_WALLET],
    })
  }

  const handleBuyWithBNB = () => {
    if (!bnbBalance || parseFloat(bnbAmount) > parseFloat(formatUnits(bnbBalance.value, bnbBalance.decimals))) {
      toast.error('Insufficient BNB balance')
      return
    }

    buyWithBNB({
      args: [RECEIVER_WALLET],
      value: parseUnits(bnbAmount, 18),
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: Math.random(),
                scale: Math.random() * 1.5,
                x: Math.random() * windowSize.width,
                y: Math.random() * windowSize.height,
              }}
              transition={{
                duration: Math.random() * 2 + 1,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
          ))}
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-8 shadow-2xl"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            <Sparkles className="inline-block mr-2" /> Top Token Sale
          </h2>
          <p className="bg-indigo-500 mt-2 text-center text-sm">
            Don't miss out on the hottest token of the year!
          </p>
        </div>
        {isConnected ? (
          <>
            <div className="flex justify-center space-x-4 mb-6">
              <button
                onClick={() => setActiveTab('usdt')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${activeTab === 'usdt'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-200 text-indigo-800 hover:bg-indigo-300'
                  }`}
              >
                Buy with USDT
              </button>
              <button
                onClick={() => setActiveTab('bnb')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${activeTab === 'bnb'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-200 text-indigo-800 hover:bg-indigo-300'
                  }`}
              >
                Buy with BNB
              </button>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'usdt' ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="usdt-amount" className="block text-sm font-medium text-indigo-200">
                        USDT Amount
                      </label>
                      <input
                        id="usdt-amount"
                        type="number"
                        value={usdtAmount}
                        onChange={handleUsdtAmountChange}
                        placeholder="Enter USDT amount"
                        className="mt-1 block w-full border-indigo-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white bg-opacity-20 text-white placeholder-indigo-300"
                      />
                    </div>
                    <button
                      onClick={handleBuyWithUSDT}
                      disabled={isUsdtTxLoading}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                    >
                      {isUsdtTxLoading ? 'Processing...' : 'Buy with USDT'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="bnb-amount" className="block text-sm font-medium text-indigo-200">
                        BNB Amount
                      </label>
                      <input
                        id="bnb-amount"
                        type="number"
                        value={bnbAmount}
                        onChange={handleBnbAmountChange}
                        placeholder="Enter BNB amount"
                        className="mt-1 block w-full border-indigo-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white bg-opacity-20 text-white placeholder-indigo-300"
                      />
                    </div>
                    <button
                      onClick={handleBuyWithBNB}
                      disabled={isBnbTxLoading}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                    >
                      {isBnbTxLoading ? 'Processing...' : 'Buy with BNB'}
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            <div className="mt-6">
              <p className="text-sm font-medium text-indigo-200">Equivalent Token Amount</p>
              <p className="text-3xl font-bold text-white flex items-center justify-center mt-2">
                <Coins className="mr-2" />
                {tokenAmount} Tokens
              </p>
            </div>
          </>
        ) : (
          <button
            onClick={() => connect()}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <Rocket className="mr-2" /> Connect Wallet
          </button>
        )}
        <div className="mt-6">
          <h3 className="text-center text-lg font-medium text-white">Why buy our token?</h3>
          <ul className="mt-4 space-y-2">
            <li className="flex items-center text-sm text-indigo-200">
              <Zap className="mr-2 text-yellow-400" /> Revolutionary blockchain technology
            </li>
            <li className="flex items-center text-sm text-indigo-200">
              <TrendingUp className="mr-2 text-green-400" /> High growth potential
            </li>
            <li className="flex items-center text-sm text-indigo-200">
              <Lock className="mr-2 text-red-400" /> Limited supply, high demand
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  )
}

