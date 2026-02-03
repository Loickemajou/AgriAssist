'use client'

import { HeroSection } from '@/components/HeroSection'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <>
      <HeroSection />

      {/* Stats Section */}
      <section className="bg-gradient-to-b from-gemini-dark to-gemini-dark/80 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            Trusted by Farmers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { label: 'Active Users', value: '10K+' },
              { label: 'Diagnoses Made', value: '50K+' },
              { label: 'Accuracy Rate', value: '95%' },
              { label: 'Countries', value: '15+' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-effect p-6 rounded-xl text-center"
              >
                <p className="text-3xl font-bold gradient-text mb-2">
                  {stat.value}
                </p>
                <p className="text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            Why Choose Gemination?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'AI-Powered Diagnosis',
                desc: 'Advanced machine learning models trained on thousands of crop diseases',
              },
              {
                title: 'Multi-Modal Input',
                desc: 'Describe issues with text, voice, or upload photos and videos for analysis',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="glass-effect p-8 rounded-xl"
              >
                <h3 className="text-xl font-bold mb-3 text-gemini-green">
                  {feature.title}
                </h3>
                <p className="text-gray-300">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
