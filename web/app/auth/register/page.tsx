'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authAPI } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function RegisterPage() {
  const [first_name, setFistname] = useState('')
  const [last_name, setLastname] = useState('')
  const [username, setUsername] = useState('')
  const [role, setRole] = useState('farmer')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [language, setLanguage] = useState('en')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const response = await authAPI.register(first_name, last_name, username, role, email, password, language)
      login(response.data.access_token, response.data.user)
      toast.success('Registration successful!')
      router.push('/diagnosis')
    } catch (error) {
      toast.error('Registration failed. Try again.')
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
            <span className="gradient-text">Join Gemination</span>
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">First Name</label>
              <input
                type="text"
                value={first_name}
                onChange={(e) => setFistname(e.target.value)}
                required
                className="w-full bg-white/10 border border-gemini-green/30 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-gemini-green"
                placeholder="First Name Last Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <input
                type="text"
                value={last_name}
                onChange={(e) => setLastname(e.target.value)}
                required
                className="w-full bg-white/10 border border-gemini-green/30 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-gemini-green"
                placeholder="Last Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-white/10 border border-gemini-green/30 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-gemini-green"
                placeholder="Username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="w-full bg-white/10 border border-gemini-green/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gemini-green max-h-64"
              >
                <option value="farmer">Farmer</option>
                <option value="expert">Expert</option>
                <option value="expert">User</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/10 border border-gemini-green/30 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-gemini-green"
                placeholder="your@email.com"
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

            <div>
              <label className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-white/10 border border-gemini-green/30 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-gemini-green"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Preferred Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-white/10 border border-gemini-green/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gemini-green max-h-64"
              >
                <optgroup label="Major Languages" className="bg-gemini-dark">
                  <option value="en" className="bg-gemini-dark">🇬🇧 English</option>
                  <option value="es" className="bg-gemini-dark">🇪🇸 Español (Spanish)</option>
                  <option value="fr" className="bg-gemini-dark">🇫🇷 Français (French)</option>
                  <option value="pt" className="bg-gemini-dark">🇵🇹 Português (Portuguese)</option>
                  <option value="de" className="bg-gemini-dark">🇩🇪 Deutsch (German)</option>
                  <option value="hi" className="bg-gemini-dark">🇮🇳 हिन्दी (Hindi)</option>
                  <option value="zh" className="bg-gemini-dark">🇨🇳 中文 (Chinese)</option>
                </optgroup>
                <optgroup label="African Languages" className="bg-gemini-dark">
                  <option value="sw" className="bg-gemini-dark">🇰🇪 Swahili (East Africa)</option>
                  <option value="yo" className="bg-gemini-dark">🇳🇬 Yoruba (West Africa)</option>
                  <option value="am" className="bg-gemini-dark">🇪🇹 Amharic (Ethiopia)</option>
                  <option value="zu" className="bg-gemini-dark">🇿🇦 Zulu (South Africa)</option>
                  <option value="ha" className="bg-gemini-dark">🇳🇪 Hausa (West Africa)</option>
                  <option value="ig" className="bg-gemini-dark">🇳🇬 Igbo (Nigeria)</option>
                  <option value="rw" className="bg-gemini-dark">🇷🇼 Kinyarwanda (Rwanda)</option>
                  <option value="ak" className="bg-gemini-dark">🇬🇭 Akan (Ghana)</option>
                  <option value="tw" className="bg-gemini-dark">🇬🇭 Twi (Ghana)</option>
                  <option value="pi" className="bg-gemini-dark">🇳🇬 Pidgin English (West Africa)</option>
                </optgroup>
              </select>
              <p className="text-xs text-gray-400 mt-2">
                💡 <span className="text-gemini-green font-semibold">Tip:</span> The language you select here will be the language you'll speak with the AI. You can change this anytime in your profile settings.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gemini-green hover:bg-gemini-green/80 disabled:opacity-50 text-white font-bold py-2 rounded-lg transition"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-gemini-green hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
