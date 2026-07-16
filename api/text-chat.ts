import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { db } from '../lib/db/index.js'
import { impactEvents } from '../lib/db/schema.js'
import { classifyNotice, menuText } from '../src/data/sms.js'

const ChatSchema = z.object({
  message: z.string().max(200),
  lang: z.enum(['en', 'es'])
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  
  const parsed = ChatSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid body parameters' })
  
  const { message, lang } = parsed.data
  const body = message.trim()
  const category = classifyNotice(body)

  const localMenuText = lang === 'es' 
    ? "Responda con el título de su documento, o un número:\n1 Aviso de Desalojo / Aviso de Cese\n2 Demanda de Evicción\n3 Citación de la Corte\n4 Fallo de Posesión\n5 Orden de Lanzamiento (Desalojo)"
    : menuText

  let textReply = ''
  if (category === 'notice-to-quit') {
    textReply = lang === 'es' ? 'Su arrendador dice que el alquiler debe terminar y da un motivo.' : 'Your landlord says the tenancy should end and gives a reason.'
  } else if (category === 'complaint') {
    textReply = lang === 'es' ? 'Se ha presentado una demanda en la corte y los papeles indican cuándo y cómo comparecer.' : 'A complaint has been filed and the papers tell you when and how to appear.'
  } else if (category === 'summons') {
    textReply = lang === 'es' ? 'Una citación indica que se ha programado una fecha de juicio y caso. No la ignore.' : 'A summons tells you a case and court date exist. Do not ignore it.'
  } else if (category === 'judgment') {
    textReply = lang === 'es' ? 'La corte dictaminó que el propietario puede dar un paso posterior hacia el desalojo.' : 'The court ruled the landlord has the legal right to take the next step toward eviction.'
  } else if (category === 'warrant') {
    textReply = lang === 'es' ? 'Documento final que autoriza a un oficial del tribunal a realizar el desalojo físico tras el proceso requerido.' : 'The final document authorizing a court officer to execute a lockout.'
  }

  let finalReply = ''
  if (textReply) {
    // Record in database!
    try {
      await db.insert(impactEvents).values({ eventType: 'sms_completed', noticeCategory: category, outcome: 'hotline_referred', sourceChannel: 'web' })
    } catch (e) {
      console.error('Error logging event in postgres:', e)
    }
    
    finalReply = `${textReply} ${
      lang === 'es' 
        ? 'Siguiente: conserve todas las páginas y fechas límite. Llame a LSNJLAW al 1-888-576-5529.' 
        : 'Next: keep every page and deadline. Call LSNJLAW at 1-888-576-5529.'
    }`
  } else {
    finalReply = lang === 'es' 
      ? `No pudimos identificar eso de forma segura. ${localMenuText}` 
      : `We could not identify that safely. ${localMenuText}`
  }

  return res.status(200).json({ reply: finalReply })
}
