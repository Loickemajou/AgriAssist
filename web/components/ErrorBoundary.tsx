'use client'

import { FiAlertCircle } from 'react-icons/fi'

interface ErrorBoundaryProps {
  error: Error
  reset: () => void
}

export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  return (
    <div className="min-h-screen bg-gemini-dark flex items-center justify-center px-4">
      <div className="glass-effect rounded-lg p-8 max-w-md text-center">
        <FiAlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-gray-400 mb-6">{error.message}</p>
        <button
          onClick={reset}
          className="bg-gemini-green hover:bg-gemini-green/80 px-6 py-2 rounded-lg font-semibold transition"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
