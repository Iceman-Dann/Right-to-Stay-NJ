export const EVENT_TYPES = ['notice_viewed', 'help_searched', 'hotline_referred', 'checklist_completed', 'draft_generated', 'sms_completed'] as const
export type EventType = typeof EVENT_TYPES[number]
export const NOTICE_CATEGORIES = ['notice-to-quit', 'complaint', 'summons', 'judgment', 'warrant', 'other'] as const
export const COUNTIES = ['Atlantic','Bergen','Burlington','Camden','Cape May','Cumberland','Essex','Gloucester','Hudson','Hunterdon','Mercer','Middlesex','Monmouth','Morris','Ocean','Passaic','Salem','Somerset','Sussex','Union','Warren'] as const
export const SMALL_CELL_THRESHOLD = 3

export function analyticsAllowed() {
  return typeof window !== 'undefined' && window.localStorage.getItem('rts-analytics-optout') !== 'true'
}

export async function recordEvent(event: { eventType: EventType; county?: string; noticeCategory?: string; outcome?: string }) {
  if (!analyticsAllowed()) return
  await fetch('/api/events', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(event), keepalive: true }).catch(() => undefined)
}
