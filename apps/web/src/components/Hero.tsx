'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <div className="relative bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6"
          >
            <span className="gradient-text">Vision Platform</span>
            <br />
            <span className="text-2xl md:text-4xl font-semibold text-gray-700 dark:text-gray-300">
              Multimodal Translation & Accessibility
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto"
          >
            Break down language barriers and enhance accessibility with AI-powered translation, 
            speech recognition, and scene description technology.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/translation" className="btn-primary text-lg px-8 py-3">
              Start Translating
            </Link>
            <Link href="/accessibility" className="btn-outline text-lg px-8 py-3">
              Accessibility Features
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
