import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/

//#### with no domain
//export default defineConfig({
//  base: '/vibe_coding_sim/',
//  plugins: [react()],
//  server: {
//    host: true,
//  },
//})

//#### with domain
export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    host: true,
  },
})
