import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      // The API (server/) persists every save into server/db.json. Vite was
      // watching that file and doing a full page reload after each action —
      // paying rent, booking a meal, etc. — which closed open sheets and
      // re-ran the session check. The React app never imports these files.
      ignored: ['**/server/**', '**/db.json'],
    },
  },
})
