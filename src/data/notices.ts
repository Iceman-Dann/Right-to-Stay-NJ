export interface NoticeType {
  name: string // default English fallback name
  timelineStep: number
  urgency: 'info' | 'warning' | 'danger'
  translationKeys: {
    name: string
    legalText: string
    plainText: string
    notMean: string
    nextStep: string
    timeframe: string
  }
}

export const noticeTypes: NoticeType[] = [
  {
    name: 'Notice to Cease',
    timelineStep: 1,
    urgency: 'info',
    translationKeys: {
      name: 'notice_cease_name',
      legalText: 'notice_cease_legal',
      plainText: 'notice_cease_plain',
      notMean: 'notice_cease_notmean',
      nextStep: 'notice_cease_next',
      timeframe: 'notice_cease_timeframe',
    }
  },
  {
    name: 'Notice to Quit',
    timelineStep: 2,
    urgency: 'warning',
    translationKeys: {
      name: 'notice_quit_name',
      legalText: 'notice_quit_legal',
      plainText: 'notice_quit_plain',
      notMean: 'notice_quit_notmean',
      nextStep: 'notice_quit_next',
      timeframe: 'notice_quit_timeframe',
    }
  },
  {
    name: 'Complaint & Summons',
    timelineStep: 3,
    urgency: 'warning',
    translationKeys: {
      name: 'notice_complaint_name',
      legalText: 'notice_complaint_legal',
      plainText: 'notice_complaint_plain',
      notMean: 'notice_complaint_notmean',
      nextStep: 'notice_complaint_next',
      timeframe: 'notice_complaint_timeframe',
    }
  },
  {
    name: 'Judgment for Possession',
    timelineStep: 4,
    urgency: 'danger',
    translationKeys: {
      name: 'notice_judgment_name',
      legalText: 'notice_judgment_legal',
      plainText: 'notice_judgment_plain',
      notMean: 'notice_judgment_notmean',
      nextStep: 'notice_judgment_next',
      timeframe: 'notice_judgment_timeframe',
    }
  },
  {
    name: 'Warrant for Removal',
    timelineStep: 5,
    urgency: 'danger',
    translationKeys: {
      name: 'notice_warrant_name',
      legalText: 'notice_warrant_legal',
      plainText: 'notice_warrant_plain',
      notMean: 'notice_warrant_notmean',
      nextStep: 'notice_warrant_next',
      timeframe: 'notice_warrant_timeframe',
    }
  }
]
