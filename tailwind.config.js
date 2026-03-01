/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // OPTC Crew Building custom palette
        'optc': {
          bg: '#0D1117',
          'bg-light': '#161B22',
          'bg-card': '#1C2333',
          'bg-hover': '#252D3D',
          border: '#30363D',
          'border-light': '#484F58',
          text: '#E6EDF3',
          'text-secondary': '#8B949E',
          accent: '#E94560',
          'accent-hover': '#FF6B81',
          blue: '#0F3460',
          'blue-light': '#1A5276',
        },
        // OPTC Type colors
        'str': '#E74C3C',
        'dex': '#2ECC71',
        'qck': '#3498DB',
        'psy': '#F1C40F',
        'int': '#9B59B6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
