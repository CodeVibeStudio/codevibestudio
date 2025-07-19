/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Sua paleta de cores...
      colors: {
        primaria: {
          DEFAULT: "#0D47A1",
          light: "#1E88E5",
        },
        secundaria: {
          DEFAULT: "#F57C00",
          light: "#FFB74D",
        },
        fundo: "#f8fafc",
        texto: "#1e293b",
        "texto-claro": "#475569",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  // ▼▼▼ CORREÇÃO APLICADA AQUI ▼▼▼
  plugins: [require("@tailwindcss/typography")],
  // ▲▲▲ FIM DA CORREÇÃO ▲▲▲
};
