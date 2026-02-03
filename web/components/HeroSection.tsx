'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FiMic, FiMessageSquare, FiUsers, FiTrendingUp } from 'react-icons/fi'

export function HeroSection() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gemini-green/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-gemini-green/10 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div className="text-center max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <h1 className="text-5xl sm:text-7xl font-bold">
            <span className="gradient-text">Intelligent Farming</span>
            <br />
            Powered by AI
          </h1>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Get instant crop diagnosis, expert advice, and connect with farming community all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link
              href="/diagnosis"
              className="bg-gemini-green hover:bg-gemini-green/80 px-8 py-3 rounded-lg font-semibold transition transform hover:scale-105"
            >
              Start Diagnosis
            </Link>
            <Link
              href="/community"
              className="border border-gemini-green text-gemini-green hover:bg-gemini-green/10 px-8 py-3 rounded-lg font-semibold transition"
            >
              Join Community
            </Link>
          </div>
        </motion.div>

        {/* Features grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mt-20"
        >
          {[
            { icon: FiMic, label: 'Voice Diagnosis', desc: 'Describe your issue by voice' },
            { icon: FiMessageSquare, label: 'AI Chat', desc: 'Get expert advice instantly' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="glass-effect p-6 rounded-xl text-center"
            >
              <feature.icon className="w-8 h-8 mx-auto text-gemini-green mb-3" />
              <h3 className="font-semibold">{feature.label}</h3>
              <p className="text-sm text-gray-400">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
