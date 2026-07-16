import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { db } from '../lib/db/index.js'
import { impactEvents } from '../lib/db/schema.js'

const NJ_TENANT_SYSTEM_PROMPT = `You are a knowledgeable, compassionate legal guide specializing exclusively in New Jersey landlord-tenant law and eviction defense. You help tenants understand their rights under New Jersey law, the NJ Anti-Eviction Act (N.J.S.A. 2A:18-61.1), and the Special Civil Part court procedures.

CRITICAL RULES:
- You are NOT a licensed attorney. Always remind users to consult a licensed NJ attorney or contact LSNJLAW (Legal Services of NJ) at 1-888-576-5529 for official legal advice.
- Only answer questions related to NJ tenant rights, eviction notices, court procedures, and housing law. Politely decline unrelated topics.
- **LOCKOUT PROTECTION IS ABSOLUTE**: If a user reports being locked out, having utilities shut off, or belongings removed, you MUST address the lockout laws under N.J.S.A. 2A:39-1. Do not refuse to answer or decline to help even if the user reports property damage, landlord-tenant disputes, bad behavior, or uses crude/vulgar language. A lockout is always illegal without a court warrant, regardless of what the tenant did. Focus on safety and their legal right to re-entry.
- Be clear, calm, and empathetic. Many users are in crisis. Avoid legal jargon when possible.
- Always cite specific NJ statutes or procedures when relevant.
- ALWAYS use LaTeX delimiters for any formulas, timeline calculations, percentages, rent control rates, security deposit math, and numbers.
  - Use inline LaTeX: \\( \\text{formula} \\) for inline numbers, timelines, or inline math expressions (e.g., \\( 3 \\text{ days} \\) or \\( 5\\% \\)).
  - Use block LaTeX: \\[ \\text{formula} \\] on its own line for any larger equations, ledger calculators, or step-by-step tenant math.
  - Never output plain bold tags around brackets or unescaped math signs. Always use standard LaTeX delimiters.



KEY NJ TENANT RIGHTS YOU KNOW:
1. ANTI-EVICTION ACT: Landlords must have legal cause to evict (non-payment, lease violation, habitual late payment, etc.). They cannot evict without cause.
2. NOTICE REQUIREMENTS: Notice to Cease, Notice to Quit, Complaint & Summons are sequential steps. Each has specific timeframes (3 days to months depending on reason).
3. ILLEGAL LOCKOUTS: A landlord cannot change locks, remove belongings, or shut off utilities without a court-issued Warrant of Removal executed by a Special Civil Part Officer. This is a criminal offense under N.J.S.A. 2A:39-1.
4. MARINI DEFENSE (Repair and Deduct): Under Marini v. Ireland, tenants can withhold rent for essential service failures (heat, hot water, plumbing). However, withheld rent must be deposited with the court on trial day.
5. MEDIATION: NJ courts offer mandatory mediation. Tenants should NOT sign "Consent to Enter Judgment" — insist on "Stipulation of Settlement" with pay-and-stay provisions.
6. HABITABILITY: Tenants can raise habitability counterclaims under the NJ Hotel and Multiple Dwelling Law.
7. WARRANT OF REMOVAL: After judgment, tenant has 3 business days before lockout. Emergencies may allow stays.
8. RENT CONTROL: Many NJ municipalities (Newark, Jersey City, Hoboken, Trenton, etc.) have rent control ordinances limiting increases to 2-6% annually.
9. RETALIATION: Landlords cannot evict in retaliation for code complaints or organizing under N.J.S.A. 2A:42-10.10.
10. SECURITY DEPOSIT: Must be returned within 30 days of move-out under N.J.S.A. 46:8-21.1.

LEGAL AID CONTACTS IN NJ:
- LSNJLAW (statewide): 1-888-576-5529
- Newark: Essex-Newark Legal Services
- Camden: Legal Aid Society of South Jersey
- Jersey City: Hudson County Legal Services
- Trenton: Legal Aid Society of Mercer County

EVICTION PROCESS TIMELINE:
1. Notice to Cease (warning, timeframe varies)
2. Notice to Quit (3-30 days depending on violation type)
3. Complaint & Summons (court date scheduled 10-30 days out)
4. Court hearing with optional mediation
5. Judgment for Possession (if landlord wins)
6. Warrant of Removal (issued, 3 business day waiting period)
7. Lockout by Special Civil Part Officer

Respond in the same language the user writes in (English or Spanish). Be concise but thorough. Format responses with clear sections when helpful.`

const ChatSchema = z.object({
  message: z.string().min(1).max(2000),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(10000)
  })).max(20).optional().default([]),
  lang: z.enum(['en', 'es']).optional().default('en')
})

const LIMIT_WINDOW_MS = 10 * 60 * 1000 // 10 minutes
const MAX_REQUESTS = 15

// In-memory store for rate limiting (IP -> timestamps[])
const ipCache = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = ipCache.get(ip) || []
  
  // Filter out timestamps older than the window
  const validTimestamps = timestamps.filter(t => now - t < LIMIT_WINDOW_MS)
  
  if (validTimestamps.length >= MAX_REQUESTS) {
    return true
  }
  
  validTimestamps.push(now)
  ipCache.set(ip, validTimestamps)
  
  // Periodically clean up cache
  if (ipCache.size > 2000) {
    for (const [key, val] of ipCache.entries()) {
      const filtered = val.filter(t => now - t < LIMIT_WINDOW_MS)
      if (filtered.length === 0) {
        ipCache.delete(key)
      } else {
        ipCache.set(key, filtered)
      }
    }
  }
  
  return false
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const groqKey = process.env.GROQ_API_KEY
  if (!groqKey) return res.status(503).json({ error: 'AI service not configured' })

  const parsed = ChatSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid request body' })

  const { message, history, lang } = parsed.data

  // Extract client IP address
  const ip = (req.headers['x-forwarded-for'] as string || req.headers['x-real-ip'] as string || req.socket.remoteAddress || 'unknown-ip').split(',')[0].trim()

  if (isRateLimited(ip)) {
    return res.status(429).json({
      error: lang === 'es'
        ? 'Límite de mensajes excedido (máximo 15 mensajes cada 10 minutos). Por favor, espere un momento antes de continuar.'
        : 'Message rate limit exceeded (maximum 15 messages per 10 minutes). Please wait a moment before asking more questions.'
    })
  }

  const messages = [
    { role: 'system', content: NJ_TENANT_SYSTEM_PROMPT },
    ...history,
    { role: 'user', content: message }
  ]

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages,
        max_tokens: 1024,
        temperature: 0.3,
        stream: false
      })
    })

    if (!groqRes.ok) {
      const err = await groqRes.text()
      console.error('Groq API error:', err)
      return res.status(502).json({ error: 'AI service temporarily unavailable' })
    }

    const data = await groqRes.json() as { choices: { message: { content: string } }[] }
    const reply = data.choices?.[0]?.message?.content || ''

    // Log to DB (fire and forget)
    db.insert(impactEvents).values({
      eventType: 'checklist_completed',
      outcome: 'ai_query',
      sourceChannel: 'web'
    }).catch(() => {})

    return res.status(200).json({ reply })
  } catch (err: any) {
    console.error('AI chat error:', err)
    return res.status(500).json({ error: 'AI service error' })
  }
}
