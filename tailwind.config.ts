import { type Config } from "tailwindcss";
import { defaultTheme } from "@maany_shr/ralph-the-moose-ui-kit";
export default {
  content: [
    "./node_modules/@maany_shr/ralph-the-moose-ui-kit/dist/**/*.js",
    "./src/**/*.tsx"
  ],
  theme: {
    ...defaultTheme,
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;
