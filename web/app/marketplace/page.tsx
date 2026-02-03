'use client'

import { useState, useEffect } from 'react'
import { marketplaceAPI } from '@/lib/api'
import { motion } from 'framer-motion'
import { FiShoppingCart, FiStar } from 'react-icons/fi'

export default function MarketplacePage() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadListings()
  }, [])

  const loadListings = async () => {
    try {
      const response = await marketplaceAPI.getListings()
      setListings(response.data || [])
    } catch (error) {
      console.error('Failed to load listings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gemini-dark py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4">
            <span className="gradient-text">Farm Marketplace</span>
          </h1>
          <p className="text-xl text-gray-400">
            Buy and sell agricultural products and services
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center text-gray-400">Loading products...</div>
        ) : listings.length === 0 ? (
          <div className="text-center text-gray-400">
            No listings available yet
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {listings.map((listing, i) => (
              <motion.div
                key={listing.id || i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass-effect rounded-xl overflow-hidden group cursor-pointer"
              >
                <div className="bg-gemini-green/10 h-40 flex items-center justify-center group-hover:bg-gemini-green/20 transition">
                  <span className="text-gray-400">
                    {listing.category || 'Product'}
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2 truncate">
                    {listing.title || listing.name}
                  </h3>

                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, j) => (
                      <FiStar
                        key={j}
                        size={14}
                        className={
                          j < (listing.rating || 4)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-600'
                        }
                      />
                    ))}
                  </div>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {listing.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gemini-green">
                      ${listing.price || '0'}
                    </span>
                    <button className="p-2 bg-gemini-green/20 hover:bg-gemini-green/40 rounded-lg transition">
                      <FiShoppingCart className="text-gemini-green" size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
