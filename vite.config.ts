import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Use '.' instead of process.cwd() to prevent TS error: Property 'cwd' does not exist on type 'Process'
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      // Polimorfismo para que process.env.API_KEY funcione en el navegador
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})