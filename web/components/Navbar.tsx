'use client'

import Link from 'next/link'
import { useAuthStore } from '@/lib/store'
import { FiLogOut, FiUser, FiMenu } from 'react-icons/fi'
import { useState } from 'react'

export function Navbar() {
  const { isAuthenticated, logout } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="glass-effect sticky top-0 z-50 border-b border-gemini-green/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-gemini-green to-green-600 rounded-lg flex items-center justify-center text-white font-bold">
              G
            </div>
            <span className="gradient-text font-bold text-xl hidden sm:inline">
              Gemination
            </span>
          </Link>

          <div className="hidden md:flex gap-6">
            <Link href="/diagnosis" className="hover:text-gemini-green transition">
              Diagnosis
            </Link>
            <Link href="/chat" className="hover:text-gemini-green transition">
              Chat
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <button className="p-2 hover:bg-white/10 rounded-lg transition">
                  <FiUser size={20} />
                </button>
                <button
                  onClick={logout}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition text-red-400"
                >
                  <FiLogOut size={20} />
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="bg-gemini-green hover:bg-gemini-green/80 px-4 py-2 rounded-lg transition"
              >
                Sign In
              </Link>
            )}
            <button
              className="md:hidden p-2"
              onClick={() => setIsOpen(!isOpen)}
            >
              <FiMenu size={20} />
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-2">
            <Link href="/diagnosis" className="hover:text-gemini-green">
              Diagnosis
            </Link>
            <Link href="/chat" className="hover:text-gemini-green">
              Chat
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
