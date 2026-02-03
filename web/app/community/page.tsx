'use client'

import { useState, useEffect } from 'react'
import { communityAPI } from '@/lib/api'
import { motion } from 'framer-motion'
import { FiHeart, FiMessageCircle, FiShare2 } from 'react-icons/fi'

export default function CommunityPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newPostText, setNewPostText] = useState('')

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      const response = await communityAPI.getPosts()
      setPosts(response.data || [])
    } catch (error) {
      console.error('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async () => {
    if (!newPostText.trim()) return

    try {
      await communityAPI.createPost({ content: newPostText })
      setNewPostText('')
      loadPosts()
    } catch (error) {
      console.error('Failed to create post')
    }
  }

  return (
    <div className="min-h-screen bg-gemini-dark py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4">
            <span className="gradient-text">Farming Community</span>
          </h1>
          <p className="text-xl text-gray-400">
            Connect with farmers and share your experience
          </p>
        </motion.div>

        {/* Create Post */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect p-6 rounded-xl mb-8"
        >
          <textarea
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            placeholder="Share your farming experience..."
            className="w-full bg-white/10 border border-gemini-green/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-gemini-green resize-none mb-4"
            rows={3}
          />
          <button
            onClick={handleCreatePost}
            className="w-full bg-gemini-green hover:bg-gemini-green/80 px-4 py-2 rounded-lg font-semibold transition"
          >
            Post
          </button>
        </motion.div>

        {/* Posts */}
        {loading ? (
          <div className="text-center text-gray-400">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="text-center text-gray-400">
            No posts yet. Be the first to share!
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post, i) => (
              <motion.div
                key={post.id || i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-effect p-6 rounded-xl"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-gemini-green/30 rounded-full flex items-center justify-center">
                    <span className="text-gemini-green font-bold">
                      {post.author?.[0] || 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">
                      {post.author_name || 'Anonymous Farmer'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {new Date(
                        post.created_at || Date.now()
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <p className="text-white mb-4">{post.content}</p>

                <div className="flex justify-between text-gray-400 pt-4 border-t border-gemini-green/20">
                  <button className="flex items-center gap-2 hover:text-gemini-green transition">
                    <FiHeart size={18} />
                    <span>Like</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-gemini-green transition">
                    <FiMessageCircle size={18} />
                    <span>Comment</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-gemini-green transition">
                    <FiShare2 size={18} />
                    <span>Share</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
