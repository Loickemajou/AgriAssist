'use client'

import { useMemo } from 'react'
import { FiMapPin } from 'react-icons/fi'

interface LocationMapProps {
  lat: number
  lng: number
  title?: string
  zoom?: number
  className?: string
}

export function LocationMap({
  lat,
  lng,
  title = 'Diagnosis Location',
  zoom = 13,
  className = '',
}: LocationMapProps) {
  // Generate OpenStreetMap embed URL
  const mapUrl = useMemo(() => {
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`
  }, [lat, lng])

  // Google Maps alternative (uncomment to use)
  // const googleMapsUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0:0x0!2z${lat}°,${lng}°!5e0!3m2!1sen!2s!4v0`

  return (
    <div className={`glass-effect rounded-lg overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gemini-green/20">
        <div className="flex items-center gap-2 text-gemini-green">
          <FiMapPin size={20} />
          <h3 className="font-semibold">{title}</h3>
        </div>
        <p className="text-sm text-gray-400 mt-2">
          {lat.toFixed(6)}, {lng.toFixed(6)}
        </p>
      </div>

      <div className="relative bg-black/20 aspect-video w-full">
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={mapUrl}
          style={{ border: 'none' }}
          title={title}
        />
      </div>

      <div className="p-3 bg-gemini-dark/50 text-xs text-gray-400">
        <p>
          <strong>Latitude:</strong> {lat.toFixed(6)}
        </p>
        <p>
          <strong>Longitude:</strong> {lng.toFixed(6)}
        </p>
        <p className="mt-2">
          <a
            href={`https://maps.google.com/?q=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gemini-green hover:underline"
          >
            View in Google Maps →
          </a>
        </p>
      </div>
    </div>
  )
}
