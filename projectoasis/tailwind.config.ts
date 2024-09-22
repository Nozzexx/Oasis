/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: 'class', // Enable dark mode support
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',    // Check if this is where your main app files are
    './src/components/**/*.{js,ts,jsx,tsx}',  // If components are outside `app` folder
    './src/pages/**/*.{js,ts,jsx,tsx}',   // For Next.js pages
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
    require('@tailwindcss/forms'), // Ensure you have this installed
  ],
};

export default config;