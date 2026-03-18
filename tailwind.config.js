/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Hans Hatch brand palette
        brand: {
          DEFAULT: '#76a72b',   // Pantone 376C — verde principal
          dark:    '#5c8420',
          light:   '#9dc454',
          bg:      '#f0f5e8',   // verde muy suave para fondos
        },
        hh: {
          dark:    '#373737',   // Pantone Neutral Black C
          mid:     '#878787',   // Cool Gray 8C
          gray:    '#ababab',   // Pantone 422C
          light:   '#efeded',   // Pantone 663C
        },
        // Surfaces (tema claro)
        bg:       '#f0eeea',
        surface:  '#ffffff',
        surface2: '#f7f6f3',
        border:   '#e4e1db',
        border2:  '#ccc9c2',
        ink:      '#2a2a2a',
        muted:    '#878787',
        faint:    '#ababab',
        // Sidebar
        sidebar:  '#373737',
      },
      fontFamily: {
        sans:    ['"Nunito Sans"', '"Avenir Next"', '"Helvetica Neue"', 'sans-serif'],
        body:    ['Roboto', 'sans-serif'],
        mono:    ['"Roboto Mono"', 'monospace'],
        // Legacy (mantener compatibilidad con páginas no rediseñadas)
        display: ['"Nunito Sans"', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        sm: '5px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        card:  '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)',
        'card-md': '0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        lg:    '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        panel: '-8px 0 40px rgba(0,0,0,0.15)',
      },
      animation: {
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        'fade-in':   'fadeIn 0.25s ease both',
        'fade-up':   'fadeUp 0.3s cubic-bezier(0.4,0,0.2,1) both',
        'slide-in':  'slideIn 0.3s cubic-bezier(0.4,0,0.2,1) both',
      },
      keyframes: {
        pulseDot: {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0.35' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { transform: 'translateX(20px)', opacity: '0' },
          to:   { transform: 'translateX(0)',    opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
