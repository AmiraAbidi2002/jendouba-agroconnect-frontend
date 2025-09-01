import { defineConfig } from 'vite/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['jwt-decode'] 
  },
  resolve: {
    alias: [
      {
        find: /^@mui\/material\/(.*)/,
        replacement: '@mui/material/$1',
      },
      {
        find: /^@mui\/icons-material\/(.*)/,
        replacement: '@mui/icons-material/$1',
      },
      {
      find: '@components',
      replacement: '/src/components',
    },
    ],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
     include: ['src/test/**/*.{test,spec}.{js,jsx,ts,tsx}'],
  }
})
