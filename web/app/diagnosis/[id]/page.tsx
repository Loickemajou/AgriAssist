'use client'

import { useState, useEffect } from 'react'
import { diagnosisAPI } from '@/lib/api'
import { ChatInterface } from '@/components/ChatInterface'
import { AudioPlayer } from '@/components/AudioPlayer'
import { LocationMap } from '@/components/LocationMap'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FiVolume2, FiMapPin, FiImage, FiChevronDown, FiChevronUp } from 'react-icons/fi'

export default function DiagnosisDetailPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const resolveMediaUrl = (url?: string | null) => {
    if (!url) return ''
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    if (url.startsWith('/')) return `${API_URL}${url}`
    return url
  }

  const params = useParams()
  const diagnosisId = Number(params.id)
  const [diagnosis, setDiagnosis] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(true)

  useEffect(() => {
    const loadDiagnosis = async () => {
      try {
        const response = await diagnosisAPI.getDiagnosis(diagnosisId)
        setDiagnosis(response.data)
        console.log('Diagnosis loaded:', response.data)
      } catch (error) {
        console.error('Failed to load diagnosis:', error)
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
        <div className="text-center">
          <p className="text-red-400 text-xl mb-2">Diagnosis not found</p>
          <p className="text-gray-400">Diagnosis ID: {diagnosisId}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gemini-dark flex flex-col">
      {/* Header with Details */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect border-b border-gemini-green/20 flex-shrink-0"
      >
        {/* Compact Summary Bar */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="max-w-7xl mx-auto p-4 cursor-pointer hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center justify-between gap-4">
            {/* Left: Crop info + thumbnail */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {diagnosis.image_url && (
                <img
                  src={resolveMediaUrl(diagnosis.image_url)}
                  alt="Crop"
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-gemini-green/30"
                />
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold truncate">
                  {diagnosis.crop || 'Diagnosis'}
                </h1>
                <p className="text-sm text-gray-400 truncate">
                  {new Date(diagnosis.created_at).toLocaleDateString()}
                  {diagnosis.treatment && (
                    <span className="ml-2 text-gemini-green">
                      • {diagnosis.treatment}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Right: Media indicators + toggle */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {diagnosis.audio_url && (
                <div className="text-gemini-green/60" title="Audio available">
                  <FiVolume2 size={18} />
                </div>
              )}
              {diagnosis.lat && diagnosis.lng && (
                <div className="text-gemini-green/60" title="Location available">
                  <FiMapPin size={18} />
                </div>
              )}
              <div className="text-gemini-green ml-2">
                {isExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-gemini-green/20"
            >
              <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Crop Name and Treatment */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {diagnosis.crop || 'Unknown Crop'}
                  </h2>
                  {diagnosis.treatment && (
                    <div className="inline-block px-4 py-2 bg-gemini-green/20 border border-gemini-green/40 rounded-lg">
                      <p className="text-gemini-green font-semibold">
                        {diagnosis.treatment}
                      </p>
                    </div>
                  )}
                </div>

                {/* Full Result */}
                {diagnosis.result && (
                  <div className="p-4 bg-gemini-green/10 border border-gemini-green/30 rounded-lg">
                    <p className="font-semibold text-gemini-green mb-2">
                      Diagnosis Result:
                    </p>
                    <p className="text-white">{diagnosis.result}</p>
                  </div>
                )}

                {/* Media Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Audio Playback */}
                  {diagnosis.audio_url && (
                    <div>
                      <div className="flex items-center gap-2 mb-3 text-gemini-green">
                        <FiVolume2 size={20} />
                        <span className="font-semibold">Voice Input</span>
                      </div>
                      <AudioPlayer
                        src={resolveMediaUrl(diagnosis.audio_url)}
                        title="Original Recording"
                      />
                    </div>
                  )}

                  {/* Image Display */}
                  {diagnosis.image_url && (
                    <div>
                      <div className="flex items-center gap-2 mb-3 text-gemini-green">
                        <FiImage size={20} />
                        <span className="font-semibold">Crop Image</span>
                      </div>
                      <div className="glass-effect rounded-lg overflow-hidden aspect-video max-h-64">
                        <img
                          src={resolveMediaUrl(diagnosis.image_url)}
                          alt="Diagnosis"
                          className="w-full h-full object-contain bg-black/20"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Location Map */}
                {diagnosis.lat && diagnosis.lng && (
                  <div>
                    <div className="flex items-center gap-2 mb-3 text-gemini-green">
                      <FiMapPin size={20} />
                      <span className="font-semibold">Diagnosis Location</span>
                    </div>
                    <div className="h-64">
                      <LocationMap lat={diagnosis.lat} lng={diagnosis.lng} />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Chat Interface - Takes remaining space */}
      <div className="flex-1 min-h-0">
        <ChatInterface diagnosisId={diagnosisId} />
      </div>
    </div>
  )
}