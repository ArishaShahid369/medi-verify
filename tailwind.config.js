/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00dbe9',
        'primary-dim': '#00aab5',
        background: '#0a0b10',
        surface: '#121318',
        'surface-low': '#1a1b21',
        'surface-mid': '#1e1f25',
        'surface-high': '#292a2f',
        'on-surface': '#e3e1e9',
        'on-surface-dim': '#b9cacb',
        outline: '#849495',
        'outline-dim': '#3b494b',
        success: '#00f5a0',
        error: '#ff4d6d',
      },
      fontFamily: {
        grotesk: ['Space Grotesk', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      backdropBlur: {
        xs: '4px',
        sm: '8px',
        md: '20px',
        lg: '40px',
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(0,219,233,0.3)',
        'glow-success': '0 0 20px rgba(0,245,160,0.3)',
        'glow-error': '0 0 20px rgba(255,77,109,0.3)',
        'glow-strong': '0 0 40px rgba(0,219,233,0.4)',
      },
      screens: {
        xs: '375px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
}