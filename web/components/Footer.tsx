'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="glass-effect border-t border-gemini-green/20 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4 gradient-text">Gemination</h3>
            <p className="text-gray-400 text-sm">
              AI-powered agricultural assistant for modern farmers
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/diagnosis" className="hover:text-gemini-green">
                  Diagnosis
                </Link>
              </li>
              <li>
                <Link href="/chat" className="hover:text-gemini-green">
                  Chat
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-gemini-green">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gemini-green">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gemini-green">
                  Support
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-gemini-green">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gemini-green">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gemini-green">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gemini-green/20 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2025 Gemination. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
