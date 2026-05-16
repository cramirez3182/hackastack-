import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'node:http'

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_ABBR: Record<string, string> = {
  Monday: 'M', Tuesday: 'T', Wednesday: 'W', Thursday: 'R', Friday: 'F', Saturday: 'Sa', Sunday: 'Su',
}
const PATTERN_ALIAS: Record<string, string> = {
  MWF: 'MWF', TR: 'TR', MW: 'MW', MTWRF: 'Daily',
}

function dayPattern(days: string[]): string {
  const sorted = [...days].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b))
  const abbr = sorted.map(d => DAY_ABBR[d] ?? d[0]).join('')
  return PATTERN_ALIAS[abbr] ?? abbr
}

type ProfRow = {
  full_name: string; department: string; avg_rating: number;
  avg_difficulty: number; would_take_again_percent: number;
  tenure_track: boolean; tags: string[]; courses_taught: string[]
}

function claudeMiddleware(apiKey: string) {
  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (!req.url?.startsWith('/api/chat')) return next()

    if (req.method === 'OPTIONS') {
      res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type' })
      res.end(); return
    }
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Method not allowed' })); return
    }

    let body = ''
    req.on('data', (chunk: Buffer) => { body += chunk.toString() })
    req.on('end', async () => {
      try {
        if (!apiKey) {
          res.writeHead(503, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY is not set in frontend/.env' }))
          return
        }

        const { message, history = [], professors = [], filters = {} } = JSON.parse(body) as {
          message: string; history: { role: string; content: string }[];
          professors: ProfRow[]; filters: Record<string, unknown>
        }

        const profContext = professors.slice(0, 40).map(p =>
          `- ${p.full_name} (${p.department}): rating=${p.avg_rating.toFixed(1)}/5, ` +
          `difficulty=${p.avg_difficulty.toFixed(1)}/5, ` +
          `would-take-again=${p.would_take_again_percent >= 0 ? Math.round(p.would_take_again_percent) + '%' : 'N/A'}, ` +
          `tenure=${p.tenure_track ? 'yes' : 'no'}, ` +
          `tags=[${p.tags.slice(0, 4).join(', ')}], ` +
          `courses=[${p.courses_taught.slice(0, 4).join(', ')}]`
        ).join('\n')

        const activeFilters = Object.entries(filters)
          .filter(([k, v]) => {
            if (k === 'minRating' && v === 0) return false
            if (k === 'maxDifficulty' && v === 5) return false
            if (k === 'minWouldTakeAgain' && v === 0) return false
            if (k === 'tenureTrack' && v === 'all') return false
            if (k === 'tags' && (v as string[]).length === 0) return false
            if (!v) return false
            if (k === 'sortBy' || k === 'sortDir') return false
            return true
          })
          .map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(', ')

        const system = `You are a friendly, knowledgeable academic advisor for Santa Clara University (SCU). Help students find the best professors.

Visible professors (${professors.length} total):
${profContext || 'No professors loaded yet.'}
${activeFilters ? `\nActive filters: ${activeFilters}` : ''}

Rules:
- Be warm and concise — 2-4 sentences unless the student asks for more detail.
- Recommend specific professors by name, citing their ratings, tags, or courses.
- Explain tradeoffs honestly (e.g. "she's tough but students keep coming back").
- If the student is vague, ask one clarifying question.`

        const messages = [...history.slice(-8), { role: 'user', content: message }]

        const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 512, system, messages }),
        })

        const data = await anthropicRes.json() as { content?: { text: string }[]; error?: { message: string } }

        if (!anthropicRes.ok) {
          res.writeHead(anthropicRes.status, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: data.error?.message ?? `API error ${anthropicRes.status}` }))
          return
        }

        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ reply: data.content?.[0]?.text ?? 'No response.' }))
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: e instanceof Error ? e.message : 'Server error' }))
      }
    })
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '') // load ALL env vars, not just VITE_
  const apiKey = env.ANTHROPIC_API_KEY ?? ''

  return {
    plugins: [
      react(),
      {
        name: 'claude-chat-api',
        configureServer(server) {
          server.middlewares.use(claudeMiddleware(apiKey))
        },
      },
    ],
    server: { port: 5173 },
  }
})
