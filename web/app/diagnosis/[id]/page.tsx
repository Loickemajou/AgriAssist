'use client'

import { useState, useEffect } from 'react'
import { diagnosisAPI } from '@/lib/api'
import { ChatInterface } from '@/components/ChatInterface'
import { AudioPlayer } from '@/components/AudioPlayer'
import { LocationMap } from '@/components/LocationMap'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { FiVolume2, FiMapPin, FiImage } from 'react-icons/fi'

export default function DiagnosisDetailPage() {
  const params = useParams()
  const diagnosisId = Number(params.id)
  const [diagnosis, setDiagnosis] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDiagnosis = async () => {
      try {
        const response = await diagnosisAPI.getDiagnosis(diagnosisId)
        setDiagnosis(response.data)
      } catch (error) {
        console.error('Failed to load diagnosis')
      } finally {
        setLoading(false)
      }
    }

    loadDiagnosis()
  }, [diagnosisId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gemini-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gemini-green/30 border-t-gemini-green rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading diagnosis...</p>
        </div>
      </div>
    )
  }

  if (!diagnosis) {
    return (
      <div className="min-h-screen bg-gemini-dark flex items-center justify-center">
        <p className="text-red-400">Diagnosis not found</p>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gemini-dark flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect border-b border-gemini-green/20 p-6 overflow-y-auto"
      >
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {diagnosis.crop_name || 'Diagnosis'}
            </h1>
            <p className="text-gray-400">
              Created on{' '}
              {new Date(diagnosis.created_at).toLocaleDateString()}
            </p>
          </div>

          {diagnosis.result && (
            <div className="p-4 bg-gemini-green/10 border border-gemini-green/30 rounded-lg">
              <p className="font-semibold text-gemini-green mb-2">
                Diagnosis Result:
              </p>
              <p className="text-white">{diagnosis.result}</p>
            </div>
          )}

          {/* Media Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Audio Playback */}
            {diagnosis.audio_url && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-3 text-gemini-green">
                  <FiVolume2 size={20} />
                  <span className="font-semibold">Voice Input</span>
                </div>
                <AudioPlayer
                  src={diagnosis.audio_url}
                  title="Original Recording"
                />
              </motion.div>
            )}

            {/* Image Display */}
            {diagnosis.image_url && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-3 text-gemini-green">
                  <FiImage size={20} />
                  <span className="font-semibold">Crop Image</span>
                </div>
                <div className="glass-effect rounded-lg overflow-hidden aspect-square">
                  <img
                    src={diagnosis.image_url}
                    alt="Diagnosis"
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Location Map */}
          {diagnosis.lat && diagnosis.lng && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-3 text-gemini-green">
                <FiMapPin size={20} />
                <span className="font-semibold">Diagnosis Location</span>
              </div>
              <LocationMap lat={diagnosis.lat} lng={diagnosis.lng} />
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Chat Interface */}
      <div className="flex-1">
        <ChatInterface diagnosisId={diagnosisId} />
      </div>
    </div>
  )
}
