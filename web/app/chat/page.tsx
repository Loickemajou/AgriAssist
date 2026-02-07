'use client'

import { useState, useEffect } from 'react'
import { diagnosisAPI, chatAPI } from '@/lib/api'
import { useDiagnosisStore } from '@/lib/store'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function ChatPage() {
  const [diagnoses, setDiagnoses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { currentDiagnosis } = useDiagnosisStore()

  useEffect(() => {
    const loadDiagnoses = async () => {
      try {
        const response = await diagnosisAPI.getDiagnoses()
        setDiagnoses(response.data)
      } catch (error) {
        console.error('Failed to load diagnoses')
      } finally {
        setLoading(false)
      }
    }

    loadDiagnoses()
  }, [])

  return (
    <div className="min-h-screen bg-gemini-dark py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4">
            <span className="gradient-text">Chat with AI</span>
          </h1>
          <p className="text-xl text-gray-400">
            Ask questions about your diagnosis and get expert advice
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center text-gray-400">Loading...</div>
        ) : diagnoses.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-400 mb-4">
              No diagnoses found. Create one first!
            </p>
            <Link
              href="/diagnosis"
              className="bg-gemini-green hover:bg-gemini-green/80 px-6 py-2 rounded-lg inline-block"
            >
              Create Diagnosis
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {diagnoses.map((diagnosis) => (
              <motion.div
                key={diagnosis.id}
                whileHover={{ y: -5 }}
                className="glass-effect p-6 rounded-xl"
              >
                <h3 className="text-xl font-bold mb-2">
                  {diagnosis.crop}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  {diagnosis.description?.substring(0, 100)}...
                </p>
                <Link
                  href={`/diagnosis/${diagnosis.id}?tab=chat`}
                  className="text-gemini-green hover:text-gemini-green/80 font-semibold"
                >
                  Open Chat →
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
