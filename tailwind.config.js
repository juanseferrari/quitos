/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    screens: {
      'xs': '475px',    // Extra small devices
      'sm': '640px',    // Small devices (landscape phones)
      'md': '768px',    // Medium devices (tablets)
      'lg': '1024px',   // Large devices (laptops)
      'xl': '1280px',   // Extra large devices (large laptops)
      '2xl': '1536px',  // 2X Extra large devices (large desktops)
      'tablet-landscape': {'raw': '(min-width: 768px) and (max-width: 1024px) and (orientation: landscape)'},
      'phone-landscape': {'raw': '(max-width: 767px) and (orientation: landscape)'},
    },
    extend: {
      fontFamily: {
        'amatic': ['Amatic SC', 'cursive'],
        'architects': ['Architects Daughter', 'cursive'],
        'rock': ['Rock Salt', 'cursive'],
        'kalam': ['Kalam', 'cursive'],
        'bad-script': ['Bad Script', 'cursive'],
      },
      colors: {
        'ink-blue': '#1e3a8a',
        'paper': '#fdfbf7',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        'game': '420px',
        'tablet': '768px',
        'desktop': '1200px',
      },
      fontSize: {
        'fluid-xs': 'clamp(0.75rem, 1.5vw, 0.875rem)',
        'fluid-sm': 'clamp(0.875rem, 2vw, 1rem)',
        'fluid-base': 'clamp(1rem, 2.5vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 3vw, 1.25rem)',
        'fluid-xl': 'clamp(1.25rem, 3.5vw, 1.5rem)',
        'fluid-2xl': 'clamp(1.5rem, 4vw, 2rem)',
        'fluid-3xl': 'clamp(1.875rem, 5vw, 2.5rem)',
        'fluid-4xl': 'clamp(2.25rem, 6vw, 3rem)',
        'fluid-5xl': 'clamp(3rem, 7vw, 4rem)',
        'fluid-6xl': 'clamp(3.75rem, 8vw, 5rem)',
      },
    },
  },
  plugins: [],
}

