'use client'

import { useState, useEffect } from 'react'
import { diagnosisAPI } from '@/lib/api'
import { DiagnosisForm } from '@/components/DiagnosisForm'
import { useDiagnosisStore } from '@/lib/store'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'

export default function DiagnosisPage() {
  const [diagnoses, setDiagnoses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(true)
  const { setCurrentDiagnosis } = useDiagnosisStore()

  const loadDiagnoses = async () => {
    setLoading(true)
    try {
      const response = await diagnosisAPI.getDiagnoses()
      setDiagnoses(response.data)
    } catch (error) {
      console.error('Failed to load diagnoses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDiagnoses()
  }, [])

  const handleFormSubmit = (diagnosisId: number) => {
    setCurrentDiagnosis({ id: diagnosisId })
    setShowForm(false)
    loadDiagnoses()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gemini-dark to-gemini-dark/80 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4">
            <span className="gradient-text">Crop Diagnosis</span>
          </h1>
          <p className="text-xl text-gray-400">
            Get instant analysis of your crop issues using AI
          </p>
        </motion.div>

        {showForm ? (
          <div className="bg-gradient-to-br from-gemini-dark/50 to-gemini-dark/30 border border-gemini-green/20 rounded-2xl p-8 mb-12">
            <DiagnosisForm onSubmit={handleFormSubmit} />
          </div>
        ) : (
          <div className="text-center mb-12">
            <button
              onClick={() => setShowForm(true)}
              className="bg-gemini-green hover:bg-gemini-green/80 px-6 py-2 rounded-lg transition"
            >
              New Diagnosis
            </button>
          </div>
        )}

        {/* Past Diagnoses */}
        <div>
          <h2 className="text-3xl font-bold mb-8">Your Diagnoses</h2>
          {loading ? (
            <div className="text-center text-gray-400">Loading...</div>
          ) : diagnoses.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              No diagnoses yet. Create your first one above!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {diagnoses.map((diagnosis) => (
                <motion.div
                  key={diagnosis.id}
                  whileHover={{ y: -5 }}
                  className="glass-effect p-6 rounded-xl cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg">{diagnosis.crop}</h3>
                    <span className="text-xs bg-gemini-green/30 text-gemini-green px-2 py-1 rounded">
                      {diagnosis.status || 'Analyzed'}
                    </span>
                  </div>

                  <p className="text-gray-400 text-sm mb-4">
                    {diagnosis.description?.substring(0, 100)}...
                  </p>

                  <div className="flex items-center gap-2 text-gemini-green group-hover:gap-4 transition">
                    <span>View Details</span>
                    <FiArrowRight size={18} />
                  </div>

                  <Link
                    href={`/diagnosis/${diagnosis.id}`}
                    className="absolute inset-0"
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
