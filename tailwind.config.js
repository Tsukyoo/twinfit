/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
      },
      colors: {
        // iOS-style colors
        ios: {
          red: '#ff3b30',
          green: '#34c759',
          blue: '#007aff',
          lightBlue: '#32ade6',
          purple: '#af52de',
          orange: '#ff9500',
          yellow: '#ffcc00',
          gray: '#8e8e93',
          lightGray: '#f5f5f7',
          mutedGray: '#f2f2f7',
        },
        // Profile colors
        teoman: {
          primary: '#34c759',
          secondary: '#32ade6',
        },
        denizhan: {
          primary: '#ff3b30',
          secondary: '#ff9500',
        },
        // App colors
        background: '#f5f5f7',
        surface: 'rgba(255, 255, 255, 0.80)',
        'surface-muted': '#f2f2f7',
        border: 'rgba(255, 255, 255, 0.65)',
        'text-main': '#111827',
        'text-secondary': '#6b7280',
        'text-muted': '#a1a1aa',
      },
      borderRadius: {
        'apple': '28px',
        'apple-lg': '32px',
      },
      boxShadow: {
        'apple': '0 8px 32px rgba(0, 0, 0, 0.04)',
        'apple-lg': '0 12px 40px rgba(0, 0, 0, 0.08)',
        'nav': '0 -4px 20px rgba(0, 0, 0, 0.05)',
      },
      backdropBlur: {
        'apple': '20px',
      },
      maxWidth: {
        'mobile': '480px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
}
