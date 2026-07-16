export type RentPayment = {
  date: string
  amount: string
  method: string
  notes: string
}

export type RepairDeduction = {
  date: string
  item: string
  cost: string
  notifiedDate: string
}

export type AnswerDraft = {
  courtCounty: string
  docketNumber: string
  hearingDate: string
  landlordName: string
  tenantNames: string
  noticeTitle: string
  noticeDate: string
  complaintReceived: string
  rentClaimed: string
  rentDisputed: string
  repairs: string
  serviceConcern: string
  story: string
  rentPayments: RentPayment[]
  repairDeductions: RepairDeduction[]
}

export const emptyDraft: AnswerDraft = {
  courtCounty: '',
  docketNumber: '',
  hearingDate: '',
  landlordName: '',
  tenantNames: '',
  noticeTitle: '',
  noticeDate: '',
  complaintReceived: '',
  rentClaimed: '',
  rentDisputed: '',
  repairs: '',
  serviceConcern: '',
  story: '',
  rentPayments: [],
  repairDeductions: []
}

export const reviewPrompts = [
  'Whether every required notice was served correctly and on time.',
  'Whether the amount of rent claimed matches your records.',
  'Whether housing conditions, repair requests, or retaliation affect the case.',
  'Whether the complaint and summons were delivered using the required procedure.',
]
