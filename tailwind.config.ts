import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        surface: '#12121a',
        'surface-elevated': '#1a1a25',
        border: '#2a2a3a',
        'text-primary': '#e8e8ed',
        'text-secondary': '#8888a0',
        'text-muted': '#55556a',
        accent: '#4a8bb5',
        'accent-hover': '#5a9bc5',
        warning: '#c49a3c',
        danger: '#b54a4a',
        'danger-high': '#d45555',
        success: '#4a9b6a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
