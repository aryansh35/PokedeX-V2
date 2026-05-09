/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#7c3aed",
          foreground: "#ffffff",
        },
        background: "#0a0a0b",
        card: {
          DEFAULT: "#121214",
          foreground: "#fafafa",
        },
      },
    },
  },
  plugins: [],
}
