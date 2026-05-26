import typography from "@tailwindcss/typography";

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#172026",
        brand: "#00843D",
        accent: "#FFD200",
        schoolGreen: "#00843D",
        schoolLime: "#A8D05F",
        schoolBlue: "#0057B8",
        schoolRed: "#D71920"
      }
    }
  },
  plugins: [typography]
};
