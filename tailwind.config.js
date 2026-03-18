/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:       '#080c08',
        surface:  '#0d110d',
        surface2: '#111611',
        surface3: '#161d16',
        border:   '#1e2d1a',
        border2:  '#2a3d24',
        ink:      '#d4e6c8',
        muted:    '#5c7a50',
        faint:    '#2a3d24',
        green: { DEFAULT:'#7ec832', dim:'#5a9422' },
        st: {
          red:    '#e04545',
          blue:   '#4d9eff',
          amber:  '#e09820',
          purple: '#9b72e8',
          gold:   '#c9a227',
        },
        sb: { bg:'#060908', border:'#161d16', muted:'#3d5535', text:'#8aab78' },
      },
      fontFamily: {
        display: ['"Exo 2"', 'sans-serif'],
        mono:    ['"Share Tech Mono"', 'monospace'],
      },
      animation: {
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        'fade-in':   'fadeIn 0.25s ease both',
        'slide-in':  'slideIn 0.3s cubic-bezier(0.4,0,0.2,1) both',
      },
      keyframes: {
        pulseDot: {
          '0%,100%': { opacity:'1', boxShadow:'0 0 8px currentColor' },
          '50%':     { opacity:'0.5', boxShadow:'0 0 3px currentColor' },
        },
        fadeIn: {
          from: { opacity:'0', transform:'translateY(6px)' },
          to:   { opacity:'1', transform:'none' },
        },
        slideIn: {
          from: { transform:'translateX(20px)', opacity:'0' },
          to:   { transform:'none', opacity:'1' },
        },
      },
    },
  },
  plugins: [],
}
