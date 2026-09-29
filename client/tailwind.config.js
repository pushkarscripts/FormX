/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        brutal: {
          bg: '#f8f8f5',
          surface: '#ffffff',
          dark: '#121212',
          cyan: '#00f0ff',
          'cyan-hover': '#00d5e3',
          'cyan-light': '#e6faff',
          yellow: '#ffe600',
          red: '#ff3b30',
          green: '#00d66c',
          muted: '#666666',
          border: '#121212',
        },
      },
      boxShadow: {
        'brutal': '4px 4px 0px #121212',
        'brutal-sm': '2px 2px 0px #121212',
        'brutal-lg': '6px 6px 0px #121212',
        'brutal-xl': '8px 8px 0px #121212',
        'brutal-cyan': '4px 4px 0px #00f0ff',
        'brutal-yellow': '4px 4px 0px #ffe600',
      },
    },
  },
  plugins: [],
};
