'use client'

import { motion } from 'framer-motion'
import { FiLoader } from 'react-icons/fi'

interface LoadingSpinnerProps {
  message?: string
}

export function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <FiLoader className="w-8 h-8 text-gemini-green" />
      </motion.div>
      <p className="text-gray-400">{message}</p>
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen bg-gemini-dark flex items-center justify-center">
      <LoadingSpinner message="Loading..." />
    </div>
  )
}
