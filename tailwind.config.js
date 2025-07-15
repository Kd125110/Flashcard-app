
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      perspective: {
        '200': '200px',
      },
      transformOrigin: {
        'center': 'center',
      },
      rotate: {
        'y-180': '180deg',
      },
      transitionProperty: {
        'transform': 'transform',
      },
      transformStyle: {
        'preserve-3d': 'preserve-3d',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.transform-style-preserve-3d': {
          'transform-style': 'preserve-3d',
        },
        '.backface-visible': {
          'backface-visibility': 'visible',
        },
        '.rotate-y-180': {
          transform: 'rotateY(180deg)',
        },
        '.perspective-200': {
          perspective: '200px',
        },
      })
    }
  ],
  safelist:[
    'backface-hidden',
    'rotate-y-180',
    'transform-style-3d',
    'perspective'
  ]
}
