/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          cyan: '#00d4ff',
          purple: '#9333ea',
          green: '#00ff88',
          red: '#ff2d55',
          yellow: '#ffcc00',
          dark: '#020617',
          surface: '#0f172a',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'float': 'floatUpDown 6s ease-in-out infinite',
        'scan': 'scan 8s linear infinite',
        'spin-slow': 'spin 12s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'fadeInUp': 'fadeInUp 0.6s ease-out forwards',
        'shimmer': 'shimmer 2s infinite',
        'gradientShift': 'gradientShift 4s ease infinite',
      },
      keyframes: {
        floatUpDown: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        scan: {
          '0%': { top: '-2px' },
          '100%': { top: '100%' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.2)' },
          '50%': { boxShadow: '0 0 50px rgba(0, 212, 255, 0.6)' },
        },
        fadeInUp: {
          from: { transform: 'translateY(24px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { left: '-100%' },
          '100%': { left: '150%' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
    },
  },
  plugins: [],
  safelist: [
    'text-green-400', 'text-red-400', 'text-amber-400', 'text-purple-400',
    'text-cyan-400', 'text-emerald-400',
    'bg-green-400', 'bg-red-400', 'bg-amber-400', 'bg-purple-400', 'bg-cyan-400',
    'border-green-500', 'border-red-500', 'border-amber-500', 'border-purple-500',
    'shadow-green-500', 'shadow-red-500', 'shadow-amber-500', 'shadow-purple-500',
  ],
}
