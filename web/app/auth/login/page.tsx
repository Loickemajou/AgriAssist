'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authAPI } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await authAPI.login(username, password)
      login(response.data.access_token, response.data.user)
      toast.success('Login successful!')
      router.push('/diagnosis')
    } catch (error) {
      toast.error('Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gemini-dark to-gemini-dark/80 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-effect rounded-2xl p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">
            <span className="gradient-text">Gemination</span>
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-white/10 border border-gemini-green/30 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-gemini-green"
                placeholder="johndoe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/10 border border-gemini-green/30 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-gemini-green"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gemini-green hover:bg-gemini-green/80 disabled:opacity-50 text-white font-bold py-2 rounded-lg transition"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-gemini-green hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
