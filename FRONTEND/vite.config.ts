import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig(({ command }) => {
  // VITE_API_URL viene inlinata durante la build, non letta a runtime. Senza, il sito
  // pubblicato chiamerebbe localhost:8080 e il catalogo resterebbe vuoto senza errori
  // evidenti. Meglio far fallire la build sul server che accorgersene dal browser.
  // Il controllo scatta solo su Render (che espone RENDER=true), così le build locali
  // continuano a funzionare con il ripiego definito in src/lib/api.ts.
  if (command === 'build' && process.env.RENDER && !process.env.VITE_API_URL?.trim()) {
    throw new Error(
      'VITE_API_URL non impostata: impostala nelle variabili del servizio su Render ' +
      'con l’URL del backend (es. https://autodealer-backend.onrender.com), poi rilancia il deploy.',
    )
  }

  return {
    plugins: [react(), tailwindcss()],
  }
})
