import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

/**
 * Dev-only middleware that handles POST /api/analyze so you can test
 * the full flow with `npm run dev` — no Vercel CLI needed.
 *
 * It dynamically loads the Vercel serverless handler via Vite's
 * ssrLoadModule (gives you HMR on the handler file for free).
 */
function apiDevMiddleware() {
  return {
    name: 'api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Only intercept /api/analyze
        if (req.url !== '/api/analyze') return next()
        if (req.method !== 'POST' && req.method !== 'OPTIONS') return next()

        // Patch Express-style helpers onto the raw Node response
        res.status = function (code) {
          this.statusCode = code
          return this
        }
        res.json = function (data) {
          if (!this.headersSent) {
            this.setHeader('Content-Type', 'application/json')
            this.end(JSON.stringify(data))
          }
        }

        // Fast-path for CORS preflight
        if (req.method === 'OPTIONS') {
          return res.status(200).json({})
        }

        // Read and parse request body
        const chunks = []
        for await (const chunk of req) chunks.push(chunk)

        try {
          req.body = JSON.parse(Buffer.concat(chunks).toString())
        } catch {
          return res.status(400).json({ error: 'Invalid JSON body.' })
        }

        // Load and execute the handler (ssrLoadModule gives HMR)
        try {
          const mod = await server.ssrLoadModule('/api/analyze.js')
          await mod.default(req, res)
        } catch (err) {
          console.error('[api-dev-middleware] Error:', err)
          if (!res.headersSent) {
            res.status(500).json({ error: 'Dev server error: ' + err.message })
          }
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Load ALL env variables (not just VITE_*) so GEMINI_API_KEY
  // is available to the dev middleware and the handler.
  const env = loadEnv(mode, process.cwd(), '')
  process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY

  return {
    plugins: [react(), tailwindcss(), apiDevMiddleware()],
  }
})
