/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0D1117',
        secondary: '#161B22',
        accent: '#58A6FF',
        sidebar: '#1c1c1c',
        'card-bg': '#1C1F26',
        destructive: '#ff0000', // Add this for the Alert component
      },
      spacing: {
        '16': '4rem',
        '64': '16rem',
      },
      transitionProperty: {
        width: 'width',
      },
      zIndex: {
        '10': 10,
      },
      flex: {
        '1': '1 1 0%',
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require("tailwindcss-animate"), // Add this plugin
  ],
};

export default config;