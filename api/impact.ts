import type { VercelRequest, VercelResponse } from '@vercel/node'
import { and, count, eq, gte } from 'drizzle-orm'
import { db } from '../lib/db/index.js'
import { impactEvents } from '../lib/db/schema.js'

const THRESHOLD = 3
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: 'DATABASE_URL environment variable is missing on the server.' })
    }
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
    const days = req.query.range === '30' ? 30 : req.query.range === '90' ? 90 : 365
    const after = new Date(Date.now() - days * 86400000)
    const category = typeof req.query.category === 'string' && req.query.category !== 'all' ? req.query.category : undefined
    const where = category ? and(gte(impactEvents.occurredAt, after), eq(impactEvents.noticeCategory, category)) : gte(impactEvents.occurredAt, after)
    const [totalRows, eventRows, countyRows, categoryRows] = await Promise.all([
      db.select({ value: count() }).from(impactEvents).where(where),
      db.select({ label: impactEvents.eventType, value: count() }).from(impactEvents).where(where).groupBy(impactEvents.eventType),
      db.select({ label: impactEvents.county, value: count() }).from(impactEvents).where(where).groupBy(impactEvents.county),
      db.select({ label: impactEvents.noticeCategory, value: count() }).from(impactEvents).where(where).groupBy(impactEvents.noticeCategory),
    ])
    const safe = (rows: { label: string | null; value: number }[]) => rows.filter(r => r.label && r.value >= THRESHOLD)
    res.setHeader('cache-control', 'public, s-maxage=300, stale-while-revalidate=600')
    return res.status(200).json({ range: days, total: totalRows[0]?.value ?? 0, events: safe(eventRows), counties: safe(countyRows), categories: safe(categoryRows), suppressionThreshold: THRESHOLD, generatedAt: new Date().toISOString() })
  } catch (error: any) {
    console.error('Impact API error:', error)
    return res.status(500).json({ error: error.message || String(error) })
  }
}
