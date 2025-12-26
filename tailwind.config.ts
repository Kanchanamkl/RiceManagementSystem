import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#16a34a',
          50: '#f0fdf4',
          100: '#dcfce7',
          600: '#16a34a',
          700: '#15803d',
        }
      }
    },
  },
  plugins: [],
  safelist: [
    'bg-green-100',
    'bg-green-600',
    'bg-red-100',
    'bg-red-600',
    'bg-yellow-100',
    'bg-yellow-600',
    'bg-blue-100',
    'bg-blue-600',
    'bg-purple-100',
    'bg-purple-600',
    'text-green-600',
    'text-green-700',
    'text-red-600',
    'text-red-700',
    'text-yellow-600',
    'text-yellow-700',
    'text-blue-600',
    'text-purple-600',
  ],
};
export default config;