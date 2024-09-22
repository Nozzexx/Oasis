/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable dark mode support
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}', // Adjust based on your file structure
    './src/app/components/**/*.{js,ts,jsx,tsx}',
    './src/app/pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0D1117', // Main background color
        secondary: '#161B22', // Sidebar background color
        accent: '#58A6FF', // Accent color for highlights
        sidebar: '#1c1c1c', // Custom sidebar color
        'card-bg': '#1C1F26', // Background for cards/central elements
      },
      spacing: {
        '16': '4rem', // For collapsed sidebar width
        '64': '16rem', // For expanded sidebar width
      },
      transitionProperty: {
        width: 'width', // Smooth transitions for collapsible sidebars
      },
      zIndex: {
        '10': 10, // For fixed elements like topbar
      },
      flex: {
        '1': '1 1 0%', // Make central view area flexible and responsive
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Remove or install if needed
  ],
};
