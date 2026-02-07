'use client'

import { useState, useRef, useEffect } from 'react'
import { FiMic, FiMicOff, FiSend } from 'react-icons/fi'
import { diagnosisAPI, chatAPI } from '@/lib/api'
import { getLanguageCode } from '@/lib/language'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { AudioPlayer } from '@/components/AudioPlayer'

interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  audioUrl?: string
}

interface ChatInterfaceProps {
  diagnosisId: number
  userLanguage?: string
}

export function ChatInterface({ diagnosisId, userLanguage = "English" }: ChatInterfaceProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const resolveMediaUrl = (url?: string | null) => {
    if (!url) return ''
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    if (url.startsWith('/')) return `${API_URL}${url}`
    return url
  }
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [needsTranscriptionReview, setNeedsTranscriptionReview] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setNeedsTranscriptionReview(false) // Clear any transcription review banner
    setIsLoading(true)

    try {
      const response = await chatAPI.sendMessage(diagnosisId, currentInput)
      console.log('Chat API response:', response.data) // Debug log
      
      // Backend returns: { text, audio_url, confidence }
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.data.text, // ✅ CORRECT - use "text" not "response"
        sender: 'ai',
        timestamp: new Date(),
        audioUrl: response.data.audio_url,
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error('Chat error:', error)
      toast.error('Failed to send message')
      // Optionally restore the message
      setInput(currentInput)
    } finally {
      setIsLoading(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        try {
          const langCode = getLanguageCode(userLanguage)
          const response = await diagnosisAPI.transcribeAudio(
            new File([audioBlob], 'audio.wav'),
            langCode
          )
          
          console.log('Transcription response:', response.data) // Debug log
          
          const text = response.data.text
          setInput(text)
          setNeedsTranscriptionReview(true)

          toast.success('Speech transcribed. Please review and accept.')
        } catch (error) {
          console.error('Transcription error:', error)
          toast.error('Failed to transcribe audio')
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Microphone error:', error)
      toast.error('Failed to access microphone')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop()) // Clean up
    setIsRecording(false)
  }

  return (
    <div className="flex flex-col h-full bg-gemini-dark">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-center">
              No messages yet. Start a conversation!
            </p>
          </div>
        )}
        
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="max-w-sm space-y-2">
              <div
                className={`px-4 py-2 rounded-lg ${
                  msg.sender === 'user'
                    ? 'bg-gemini-green text-white'
                    : 'glass-effect text-gray-100'
                }`}
              >
                {msg.text}
              </div>
              {msg.sender === 'ai' && msg.audioUrl && (
                <AudioPlayer
                  src={resolveMediaUrl(msg.audioUrl)}
                  title="Listen to AI answer"
                  className="mt-1"
                />
              )}
            </div>
          </motion.div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="glass-effect px-4 py-2 rounded-lg">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-gemini-green rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gemini-green rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gemini-green rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gemini-green/20 p-4 glass-effect flex-shrink-0">
        {needsTranscriptionReview && (
          <div className="mb-2 p-2 bg-yellow-600/20 rounded flex items-center justify-between text-sm">
            <div className="text-yellow-200">
              Please review the transcribed text. Edit it if needed, or accept to continue.
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => inputRef.current?.focus()}
                className="px-2 py-1 bg-gemini-green/20 rounded hover:bg-gemini-green/30 transition"
              >
                Edit
              </button>
              <button
                onClick={() => setNeedsTranscriptionReview(false)}
                className="px-2 py-1 bg-gemini-green rounded hover:bg-gemini-green/80 transition"
              >
                Accept
              </button>
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="Ask a question or describe your issue..."
              className="w-full bg-white/10 border border-gemini-green/30 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-gemini-green"
              disabled={isLoading}
            />
          </div>
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
            className={`p-2 rounded-lg transition ${
              isRecording
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-gemini-green/20 text-gemini-green hover:bg-gemini-green/30'
            } disabled:opacity-50`}
          >
            {isRecording ? <FiMicOff size={20} /> : <FiMic size={20} />}
          </button>
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-gemini-green hover:bg-gemini-green/80 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-lg transition"
          >
            <FiSend size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}