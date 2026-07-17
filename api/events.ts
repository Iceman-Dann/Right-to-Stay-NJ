import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { db } from '../lib/db/index.js'
import { impactEvents } from '../lib/db/schema.js'

const EventSchema = z.object({
  eventType: z.enum(['notice_viewed','help_searched','hotline_referred','checklist_completed','draft_generated','sms_completed']),
  county: z.string().max(30).optional(),
  noticeCategory: z.enum(['notice-to-quit','complaint','summons','judgment','warrant','other']).optional(),
  outcome: z.string().max(40).regex(/^[a-z0-9_-]+$/).optional(),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: 'DATABASE_URL environment variable is missing on the server.' })
    }
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
    const parsed = EventSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Invalid structured event' })
    const { eventType, county, noticeCategory, outcome } = parsed.data
    await db.insert(impactEvents).values({ eventType, county, noticeCategory, outcome, sourceChannel: 'web' })
    return res.status(204).end()
  } catch (error: any) {
    console.error('Events API error:', error)
    return res.status(500).json({ error: error.message || String(error) })
  }
}
