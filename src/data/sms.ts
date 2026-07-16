export type NoticeCategory = 'notice-to-quit' | 'complaint' | 'summons' | 'judgment' | 'warrant' | 'other'

export const SMS_OPTIONS: { number: string; category: NoticeCategory; label: string; keywords: string[]; reply: string }[] = [
  { number: '1', category: 'notice-to-quit', label: 'Notice to Quit / Cease', keywords: ['notice to quit','notice to cease','quit and surrender','lease termination'], reply: 'A Notice to Quit says your landlord wants the tenancy to end. It is not a same-day lockout order.' },
  { number: '2', category: 'complaint', label: 'Eviction Complaint', keywords: ['complaint for possession','verified complaint','landlord tenant complaint'], reply: 'A complaint starts a court case. It is not the judge’s decision.' },
  { number: '3', category: 'summons', label: 'Court Summons', keywords: ['summons','court date','special civil part'], reply: 'A summons tells you a case and court date exist. Do not ignore it.' },
  { number: '4', category: 'judgment', label: 'Judgment for Possession', keywords: ['judgment for possession','judgment entered'], reply: 'A judgment is a serious court decision, but it is not permission for a landlord to lock you out personally.' },
  { number: '5', category: 'warrant', label: 'Warrant of Removal', keywords: ['warrant of removal','court officer','removal date'], reply: 'A Warrant of Removal is urgent. Contact legal aid and the court immediately.' },
]

export function classifyNotice(input: string): NoticeCategory | null {
  const normalized = input.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
  const numbered = SMS_OPTIONS.find(option => option.number === normalized)
  if (numbered) return numbered.category
  const matches = SMS_OPTIONS.filter(option => option.keywords.some(keyword => normalized.includes(keyword)))
  return matches.length === 1 ? matches[0].category : null
}

export const menuText = `Reply with the title on your paper, or a number:\n1 Notice to Quit/Cease\n2 Eviction Complaint\n3 Court Summons\n4 Judgment for Possession\n5 Warrant of Removal`
