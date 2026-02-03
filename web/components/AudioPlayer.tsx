'use client'

import { useRef, useState } from 'react'
import { FiPlay, FiPause, FiVolume2 } from 'react-icons/fi'

interface AudioPlayerProps {
  src: string
  title?: string
  className?: string
}

export function AudioPlayer({ src, title, className = '' }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    setCurrentTime(time)
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
  }

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className={`glass-effect p-4 rounded-lg ${className}`}>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      {title && <p className="text-sm font-semibold mb-2 text-gemini-green">{title}</p>}

      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="flex-shrink-0 p-2 bg-gemini-green/20 hover:bg-gemini-green/40 rounded-lg transition"
        >
          {isPlaying ? (
            <FiPause className="text-gemini-green" size={20} />
          ) : (
            <FiPlay className="text-gemini-green" size={20} />
          )}
        </button>

        <div className="flex-1">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            className="w-full h-2 bg-gemini-green/20 rounded cursor-pointer appearance-none"
            style={{
              background: `linear-gradient(to right, #10A37F 0%, #10A37F ${
                duration ? (currentTime / duration) * 100 : 0
              }%, rgba(16, 163, 127, 0.2) ${duration ? (currentTime / duration) * 100 : 0}%, rgba(16, 163, 127, 0.2) 100%)`,
            }}
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-400 flex-shrink-0">
          <FiVolume2 size={16} />
          <span>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  )
}
