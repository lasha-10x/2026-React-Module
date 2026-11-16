/**
 * NOTE: tells Vite how to build the app.
 * Why it exists: Vite is the dev server and the bundler. It needs to know we use React and Tailwind.
 * The @/ alias resolves to src/.
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
});
