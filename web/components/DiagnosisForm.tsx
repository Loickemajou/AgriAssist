'use client'

import { useState, useRef, useEffect } from 'react'
import { FiUpload, FiMic, FiCamera, FiMapPin, FiVideo, FiPlay, FiSquare } from 'react-icons/fi'
import { diagnosisAPI } from '@/lib/api'
import { getUserLocation } from '@/lib/geolocation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface DiagnosisFormProps {
  onSubmit?: (diagnosisId: number) => void
}

interface Location {
  lat: number
  lng: number
}

export function DiagnosisForm({ onSubmit }: DiagnosisFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [video, setVideo] = useState<File | null>(null)
  const [location, setLocation] = useState<Location | null>(null)
  const [isRecordingDescription, setIsRecordingDescription] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  
  // Camera states
  const [imageCaptureMode, setImageCaptureMode] = useState<'upload' | 'camera'>('upload')
  const [videoCaptureMode, setVideoCaptureMode] = useState<'upload' | 'camera'>('upload')
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isRecordingVideo, setIsRecordingVideo] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  
  const descriptionRecorderRef = useRef<MediaRecorder | null>(null)
  const descriptionChunksRef = useRef<Blob[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoRecorderRef = useRef<MediaRecorder | null>(null)
  const videoChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    return () => {
      // Cleanup camera stream on unmount
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [cameraStream])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      toast.success('Image uploaded')
    }
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVideo(file)
      toast.success('Video uploaded')
    }
  }

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 },
        audio: true 
      })
      setCameraStream(stream)
      setIsCameraActive(true)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      toast.error('Failed to access camera. Please check permissions.')
    }
  }

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
      setIsCameraActive(false)
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current) return
    
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0)
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' })
          setImage(file)
          toast.success('Photo captured!')
          stopCamera()
        }
      }, 'image/jpeg')
    }
  }

  const startVideoRecording = () => {
    if (!cameraStream) return

    const mediaRecorder = new MediaRecorder(cameraStream)
    videoRecorderRef.current = mediaRecorder
    videoChunksRef.current = []

    mediaRecorder.ondataavailable = (event) => {
      videoChunksRef.current.push(event.data)
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(videoChunksRef.current, { type: 'video/webm' })
      const file = new File([blob], 'captured-video.webm', { type: 'video/webm' })
      setVideo(file)
      toast.success('Video recorded!')
      setIsRecordingVideo(false)
    }

    mediaRecorder.start()
    setIsRecordingVideo(true)
  }

  const stopVideoRecording = () => {
    videoRecorderRef.current?.stop()
  }

  const handleGetLocation = async () => {
    setIsGettingLocation(true)
    try {
      const loc = await getUserLocation()
      setLocation(loc)
      toast.success(`Location captured: ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`)
    } catch (error) {
      toast.error('Failed to get location. Please check permissions.')
    } finally {
      setIsGettingLocation(false)
    }
  }

  const startDescriptionRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      descriptionRecorderRef.current = mediaRecorder
      descriptionChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        descriptionChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(descriptionChunksRef.current, { type: 'audio/wav' })
        const audioFile = new File([audioBlob], 'description.wav')
        
        try {
          const response = await diagnosisAPI.transcribeAudio(audioFile)
          const transcribedText = response.data.text
          setDescription(transcribedText)
          toast.success('Speech transcribed to text')
        } catch (error) {
          toast.error('Failed to transcribe speech')
        }
      }

      mediaRecorder.start()
      setIsRecordingDescription(true)
    } catch (error) {
      toast.error('Failed to access microphone')
    }
  }

  const stopDescriptionRecording = () => {
    descriptionRecorderRef.current?.stop()
    setIsRecordingDescription(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!image && !video && !description) {
      toast.error('Please provide description, image, or video')
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      if (image) formData.append('image', image)
      if (video) formData.append('video', video)
      if (description) formData.append('description', description)
      if (location) {
        formData.append('lat', location.lat.toString())
        formData.append('lng', location.lng.toString())
      }

      const response = await diagnosisAPI.createDiagnosis(formData)
      toast.success('Diagnosis created successfully!')
      onSubmit?.(response.data.id)
    } catch (error) {
      toast.error('Failed to create diagnosis')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Text Input */}
      <div>
        <label className="block text-lg font-semibold mb-2">
          Describe Your Issue
        </label>
        <div className="space-y-3">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the symptoms or issues you're seeing with your crops..."
            className="w-full bg-white/10 border border-gemini-green/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-gemini-green resize-none"
            rows={4}
          />
          <button
            type="button"
            onClick={isRecordingDescription ? stopDescriptionRecording : startDescriptionRecording}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition text-sm ${
              isRecordingDescription
                ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                : 'border border-gemini-green/30 text-gemini-green hover:border-gemini-green'
            }`}
          >
            <FiMic size={18} />
            {isRecordingDescription ? 'Stop Recording Symptoms...' : '🎤 Or Use Your Voice'}
          </button>
        </div>
      </div>

      {/* Image Upload/Capture */}
      <div>
        <label className="block text-lg font-semibold mb-2">
          Image (Optional)
        </label>
        
        {/* Mode Toggle */}
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => setImageCaptureMode('upload')}
            className={`px-3 py-1 rounded text-sm ${imageCaptureMode === 'upload' ? 'bg-gemini-green text-white' : 'bg-gray-600 text-gray-300'}`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => {
              setImageCaptureMode('camera')
              stopCamera() // Stop any active camera
            }}
            className={`px-3 py-1 rounded text-sm ${imageCaptureMode === 'camera' ? 'bg-gemini-green text-white' : 'bg-gray-600 text-gray-300'}`}
          >
            Take Photo
          </button>
        </div>

        {imageCaptureMode === 'upload' ? (
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-input"
            />
            <label
              htmlFor="image-input"
              className="flex items-center justify-center gap-2 border-2 border-dashed border-gemini-green/30 rounded-lg p-6 cursor-pointer hover:border-gemini-green transition"
            >
              <FiCamera size={24} className="text-gemini-green" />
              <div>
                <p className="font-semibold">
                  {image ? image.name : 'Click to upload image'}
                </p>
                <p className="text-sm text-gray-400">PNG, JPG up to 10MB</p>
              </div>
            </label>
          </div>
        ) : (
          <div className="space-y-3">
            {!isCameraActive ? (
              <button
                type="button"
                onClick={startCamera}
                className="w-full flex items-center justify-center gap-2 border border-gemini-green/30 text-gemini-green hover:border-gemini-green px-4 py-3 rounded-lg transition"
              >
                <FiCamera size={20} />
                Open Camera
              </button>
            ) : (
              <div className="space-y-3">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-lg bg-black"
                  style={{ maxHeight: '300px' }}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="flex-1 bg-gemini-green hover:bg-gemini-green/80 text-white px-4 py-2 rounded-lg transition"
                  >
                    📸 Capture Photo
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-4 py-2 border border-red-500/30 text-red-400 hover:border-red-500 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Video Upload/Capture */}
      <div>
        <label className="block text-lg font-semibold mb-2">
          Video (Optional)
        </label>
        
        {/* Mode Toggle */}
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => setVideoCaptureMode('upload')}
            className={`px-3 py-1 rounded text-sm ${videoCaptureMode === 'upload' ? 'bg-gemini-green text-white' : 'bg-gray-600 text-gray-300'}`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => {
              setVideoCaptureMode('camera')
              stopCamera() // Stop any active camera
            }}
            className={`px-3 py-1 rounded text-sm ${videoCaptureMode === 'camera' ? 'bg-gemini-green text-white' : 'bg-gray-600 text-gray-300'}`}
          >
            Record Video
          </button>
        </div>

        {videoCaptureMode === 'upload' ? (
          <div className="relative">
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
              id="video-input"
            />
            <label
              htmlFor="video-input"
              className="flex items-center justify-center gap-2 border-2 border-dashed border-gemini-green/30 rounded-lg p-6 cursor-pointer hover:border-gemini-green transition"
            >
              <FiVideo size={24} className="text-gemini-green" />
              <div>
                <p className="font-semibold">
                  {video ? video.name : 'Click to upload video'}
                </p>
                <p className="text-sm text-gray-400">MP4, AVI up to 50MB</p>
              </div>
            </label>
          </div>
        ) : (
          <div className="space-y-3">
            {!isCameraActive ? (
              <button
                type="button"
                onClick={startCamera}
                className="w-full flex items-center justify-center gap-2 border border-gemini-green/30 text-gemini-green hover:border-gemini-green px-4 py-3 rounded-lg transition"
              >
                <FiVideo size={20} />
                Open Camera for Recording
              </button>
            ) : (
              <div className="space-y-3">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-lg bg-black"
                  style={{ maxHeight: '300px' }}
                />
                <div className="flex gap-2">
                  {!isRecordingVideo ? (
                    <button
                      type="button"
                      onClick={startVideoRecording}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <FiPlay size={18} />
                      🎥 Start Recording
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopVideoRecording}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition flex items-center justify-center gap-2 animate-pulse"
                    >
                      <FiSquare size={18} />
                      ⏹️ Stop Recording
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-4 py-2 border border-gray-500/30 text-gray-400 hover:border-gray-500 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Location Capture */}
      <div>
        <label className="block text-lg font-semibold mb-2">
          Capture Location (Optional)
        </label>
        <button
          type="button"
          onClick={handleGetLocation}
          disabled={isGettingLocation}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition ${
            location
              ? 'bg-gemini-green/20 text-gemini-green border border-gemini-green/50'
              : 'border-2 border-gemini-green/30 text-gemini-green hover:border-gemini-green disabled:opacity-50'
          }`}
        >
          <FiMapPin size={20} />
          {isGettingLocation
            ? 'Getting Location...'
            : location
              ? `Location Set ✓ (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`
              : 'Capture Location'}
        </button>
        <p className="text-xs text-gray-400 mt-2">
          💡 <span className="text-gemini-green font-semibold">Why location matters:</span> We use your location to provide more precise diagnoses based on regional climate, soil conditions, and local crop diseases in your area.
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gemini-green hover:bg-gemini-green/80 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition transform hover:scale-105"
      >
        {isLoading ? 'Analyzing...' : 'Get Diagnosis'}
      </button>
    </motion.form>
  )
}
