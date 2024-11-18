// Import withMT from Material Tailwind
import withMT from "@material-tailwind/react/utils/withMT.js";

// Export configuration
export default withMT({
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
});
