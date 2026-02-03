'use client'

import { useState, useRef, useEffect } from 'react'
import { FiMic, FiMicOff, FiSend } from 'react-icons/fi'
import { diagnosisAPI, chatAPI } from '@/lib/api'
import { getLanguageCode } from '@/lib/language'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
}

interface ChatInterfaceProps {
  diagnosisId: number
  userLanguage?: string
}

export function ChatInterface({ diagnosisId, userLanguage = "English" }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [transcriptionConfidence, setTranscriptionConfidence] = useState<number | null>(null)
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
    setInput('')
    setIsLoading(true)

    try {
      const response = await chatAPI.sendMessage(diagnosisId, input)
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.data.response,
        sender: 'ai',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      toast.error('Failed to send message')
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
          // Send audio to backend with user's language code for accurate transcription
          const langCode = getLanguageCode(userLanguage)
          const response = await diagnosisAPI.transcribeAudio(
            new File([audioBlob], 'audio.wav'),
            langCode
          )
          // response includes text and confidence
          const text = response.data.text
          const confidence = response.data.confidence ?? 0
          setInput(text)
          setTranscriptionConfidence(confidence)
          if (confidence >= 0.7) {
            toast.success('Speech transcribed successfully')
          } else {
            toast('Low transcription confidence — please review the text')
          }
        } catch (error) {
          toast.error('Failed to transcribe audio')
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      toast.error('Failed to access microphone')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  return (
    <div className="flex flex-col h-screen bg-gemini-dark">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-sm px-4 py-2 rounded-lg ${
                msg.sender === 'user'
                  ? 'bg-gemini-green text-white'
                  : 'glass-effect text-gray-100'
              }`}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="glass-effect px-4 py-2 rounded-lg">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-gemini-green rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gemini-green rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gemini-green rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gemini-green/20 p-4 glass-effect">
        <div className="flex gap-2">
          <div className="flex-1">
            {transcriptionConfidence !== null && transcriptionConfidence < 0.7 && (
              <div className="mb-2 p-2 bg-yellow-600/20 rounded flex items-center justify-between text-sm">
                <div>
                  Low transcription confidence ({(transcriptionConfidence * 100).toFixed(0)}%).
                  Please edit the text or accept to continue.
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => inputRef.current?.focus()}
                    className="px-2 py-1 bg-gemini-green/20 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setTranscriptionConfidence(null)}
                    className="px-2 py-1 bg-gemini-green rounded"
                  >
                    Accept
                  </button>
                </div>
              </div>
            )}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask a question or describe your issue..."
              className="w-full bg-white/10 border border-gemini-green/30 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-gemini-green"
            />
          </div>
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-2 rounded-lg transition ${
              isRecording
                ? 'bg-red-500/20 text-red-400'
                : 'bg-gemini-green/20 text-gemini-green'
            }`}
          >
            {isRecording ? <FiMicOff size={20} /> : <FiMic size={20} />}
          </button>
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-gemini-green hover:bg-gemini-green/80 disabled:opacity-50 p-2 rounded-lg transition"
          >
            <FiSend size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
