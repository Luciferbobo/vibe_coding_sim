import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/vibe_coding_sim/',
  plugins: [react()],
  server: {
    host: true,
  },
})
