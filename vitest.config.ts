/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    testTimeout: 30000,
    hookTimeout: 10000,
    teardownTimeout: 10000,
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', 'cypress'],
    reporter: ['verbose', 'json'],
    outputFile: {
      json: './test-results.json'
    }
  },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || 'https://jeyrciyahbkgjoqikapw.supabase.co'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpleXJjaXlhaGJrZ2pvcWlrYXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI2MjEsImV4cCI6MjA2ODA4ODYyMX0.UIOc3GRhpGLlvj-K44y5uhrh6QTjhnaId3VlqVKt75w')
  }
})
