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
        brand: "#5F7F32",
        accent: "#F5E011",
        schoolGreen: "#7EA652",
        schoolLime: "#ABC252",
        schoolBlue: "#4A9ED3",
        schoolRed: "#DD5B3E"
      }
    }
  },
  plugins: [typography]
};
