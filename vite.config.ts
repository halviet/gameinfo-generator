import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import {webfontDownload} from "vite-plugin-webfont-dl";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        webfontDownload([
            'https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&family=Geist:wght@100..900&display=swap'
        ])
    ],
    base: '/gameinfo-generator/',
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    define: {
        'import.meta.env.APP_VERSION': JSON.stringify(process.env.npm_package_version),
    }
})
