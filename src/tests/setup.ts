// Test setup file for Vitest
import { beforeAll, afterAll } from 'vitest'
import '@testing-library/jest-dom'

// Setup environment variables
beforeAll(() => {
  process.env.VITE_SUPABASE_URL = 'https://jeyrciyahbkgjoqikapw.supabase.co'
  process.env.VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpleXJjaXlhaGJrZ2pvcWlrYXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTI2MjEsImV4cCI6MjA2ODA4ODYyMX0.UIOc3GRhpGLlvj-K44y5uhrh6QTjhnaId3VlqVKt75w'
})

afterAll(() => {
  // Cleanup if needed
})
