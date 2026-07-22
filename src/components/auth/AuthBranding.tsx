'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export function AuthBranding() {
  return (
    <div className="relative hidden w-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
      <div className="absolute inset-0 bg-zinc-900" />
      
      {/* Decorative math symbols / LaTeX aesthetic floating in background */}
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-20 text-6xl font-serif text-white/40"
        >
          ∫
        </motion.div>
        <motion.div
          animate={{
            y: [0, 30, 0],
            rotate: [0, -10, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-40 right-20 text-5xl font-serif text-white/40"
        >
          ∑
        </motion.div>
        <motion.div
          animate={{
            x: [0, 20, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-1/2 text-4xl font-serif text-white/40"
        >
          ∂x
        </motion.div>
        <motion.div
          animate={{
            y: [0, -40, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-20 left-40 text-7xl font-serif text-white/10"
        >
          Δ
        </motion.div>
      </div>

      <div className="relative z-20 flex items-center text-lg font-medium">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          LaTeX Report Studio
        </Link>
      </div>
      
      <div className="relative z-20 mt-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <blockquote className="space-y-2">
            <p className="text-lg font-serif italic">
              "The most beautiful thing we can experience is the mysterious. It is the source of all true art and science."
            </p>
            <footer className="text-sm opacity-80 text-right">— Albert Einstein</footer>
          </blockquote>
        </motion.div>
      </div>
    </div>
  );
}
