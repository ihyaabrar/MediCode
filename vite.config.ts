/// <reference types="node" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import fs from 'fs'

const copyExtensionFiles = () => ({
  name: 'copy-extension-files',
  closeBundle() {
    fs.copyFileSync(
      resolve(__dirname, 'manifest.json'),
      resolve(__dirname, 'build/manifest.json')
    )
    const srcIcons = resolve(__dirname, 'icons')
    const distIcons = resolve(__dirname, 'build/icons')
    if (fs.existsSync(srcIcons)) {
      if (!fs.existsSync(distIcons)) fs.mkdirSync(distIcons, { recursive: true })
      fs.readdirSync(srcIcons).forEach((file: string) => {
        fs.copyFileSync(resolve(srcIcons, file), resolve(distIcons, file))
      })
    }
  },
})

export default defineConfig({
  plugins: [react(), copyExtensionFiles()],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        options: resolve(__dirname, 'options.html'),
        background: resolve(__dirname, 'src/background/index.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
    outDir: 'build',
    emptyOutDir: true,
  },
})
