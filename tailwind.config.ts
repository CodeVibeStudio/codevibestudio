// tailwind.config.ts
// Adicionamos o plugin de tipografia (@tailwindcss/typography)
// para estilizar automaticamente o HTML gerado pelo Tiptap.

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Você pode estender seu tema aqui
    },
  },
  // ADIÇÃO: Plugin de tipografia para estilizar o conteúdo do editor.
  // Isso resolve o problema de espaçamento entre linhas e parágrafos.
  plugins: [require("@tailwindcss/typography")],
};
export default config;
