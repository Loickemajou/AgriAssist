'use client'

/**
 * Geolocation utility for getting user's latitude and longitude
 * Uses browser's native Geolocation API
 */

export interface Location {
  lat: number
  lng: number
  accuracy?: number
}

/**
 * Get user's current location
 * Requires user permission from browser
 * @returns Promise with latitude and longitude
 */
export async function getUserLocation(): Promise<Location> {
  return new Promise((resolve, reject) => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    // Get current position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  })
}

/**
 * Watch user's location in real-time
 * @param onLocationChange Callback function when location changes
 * @returns Function to stop watching
 */
export function watchUserLocation(
  onLocationChange: (location: Location) => void,
  onError?: (error: string) => void
): () => void {
  if (!navigator.geolocation) {
    onError?.('Geolocation is not supported by this browser')
    return () => {}
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      onLocationChange({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
      })
    },
    (error) => {
      onError?.(error.message)
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  )

  // Return function to stop watching
  return () => {
    navigator.geolocation.clearWatch(watchId)
  }
}
