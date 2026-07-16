import { useState } from 'react'
import { PageIntro, useTranslation, PlusIcon, TrashIcon, PrintIcon, BackIcon, WarningIcon, SparkleIcon } from '../components'
import { type AnswerDraft, type RentPayment, type RepairDeduction, emptyDraft, reviewPrompts } from '../data/interview'
import { recordEvent } from '../data/privacy'

const fields: { key: keyof AnswerDraft; labelKey: string; section: string; type?: string }[] = [
  { key: 'courtCounty', labelKey: 'court_check_county', section: 'Court and parties' },
  { key: 'docketNumber', labelKey: 'court_check_docket', section: 'Court and parties' },
  { key: 'hearingDate', labelKey: 'court_check_date', section: 'Court and parties', type: 'date' },
  { key: 'landlordName', labelKey: 'court_check_landlord', section: 'Court and parties' },
  { key: 'tenantNames', labelKey: 'court_check_tenant', section: 'Court and parties' },
  { key: 'noticeTitle', labelKey: 'court_check_notice_title', section: 'Papers received' },
  { key: 'noticeDate', labelKey: 'court_check_notice_date', section: 'Papers received', type: 'date' },
  { key: 'complaintReceived', labelKey: 'court_check_how_received', section: 'Papers received' },
  { key: 'rentClaimed', labelKey: 'calc_landlord_claim', section: 'Facts to review', type: 'number' },
  { key: 'rentDisputed', labelKey: 'court_check_rent_disputed', section: 'Facts to review' },
  { key: 'repairs', labelKey: 'court_check_repairs', section: 'Facts to review' },
  { key: 'serviceConcern', labelKey: 'court_check_service_concern', section: 'Facts to review' },
  { key: 'story', labelKey: 'court_check_story', section: 'Facts to review' }
]

export function PrepareAnswer() {
  const { t } = useTranslation()
  const [draft, setDraft] = useState<AnswerDraft>(emptyDraft)
  const [ack, setAck] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [auditResult, setAuditResult] = useState<string>('')
  const [auditLoading, setAuditLoading] = useState<boolean>(false)
  const [auditError, setAuditError] = useState<string>('')

  function renderInlineContent(content: string) {
    const regex = /(\\\[[\s\S]*?\\\]|\\\(.*?\\\)|(?:\*\*.*?\*\*)|(?:\*.*?\*))/g
    const parts = content.split(regex)

    return parts.map((part, idx) => {
      if (part.startsWith('\\[') && part.endsWith('\\]')) {
        const formula = part.slice(2, -2).trim()
        return (
          <div key={idx} className="my-2 p-2.5 bg-ink/5 border-l border-margin rounded font-mono text-[11px] overflow-x-auto text-center block-latex">
            {formula}
          </div>
        )
      }
      if (part.startsWith('\\(') && part.endsWith('\\)')) {
        const formula = part.slice(2, -2).trim()
        return (
          <span key={idx} className="inline-block px-1.5 py-0.5 mx-0.5 bg-ink/5 rounded font-mono text-[11px] text-margin font-semibold">
            {formula}
          </span>
        )
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-bold">{part.slice(2, -2)}</strong>
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={idx} className="italic">{part.slice(1, -1)}</em>
      }
      return part
    })
  }

  function formatMessage(content: string) {
    const lines = content.split('\n')
    return lines.map((line, lineIdx) => {
      const trimmed = line.trim()
      if (!trimmed) return <div key={lineIdx} className="h-1.5" />

      if (trimmed.startsWith('### ')) {
        return <h4 key={lineIdx} className="font-bold text-xs text-ink mt-2 mb-0.5 uppercase tracking-wider">{renderInlineContent(trimmed.slice(4))}</h4>
      }
      if (trimmed.startsWith('## ')) {
        return <h3 key={lineIdx} className="font-bold text-sm text-ink mt-3 mb-1">{renderInlineContent(trimmed.slice(3))}</h3>
      }
      if (trimmed.startsWith('# ')) {
        return <h2 key={lineIdx} className="font-bold text-base text-ink mt-3 mb-1">{renderInlineContent(trimmed.slice(2))}</h2>
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
        return <li key={lineIdx} className="ml-3 list-disc text-xs leading-relaxed mb-0.5">{renderInlineContent(trimmed.slice(2))}</li>
      }

      const numMatch = trimmed.match(/^(\d+)\.\s(.*)/)
      if (numMatch) {
        return (
          <div key={lineIdx} className="flex gap-1.5 text-xs leading-relaxed mb-0.5 ml-1">
            <span className="font-semibold text-margin">{numMatch[1]}.</span>
            <div className="flex-1">{renderInlineContent(numMatch[2])}</div>
          </div>
        )
      }

      return <p key={lineIdx} className="text-xs leading-relaxed mb-1.5">{renderInlineContent(line)}</p>
    })
  }

  async function runAudit() {
    setAuditLoading(true)
    setAuditResult('')
    setAuditError('')

    const isSpanish = t('en') !== 'en'
    
    const promptText = `Analyze the following NJ eviction defense packet inputs under NJ landlord-tenant law. Identify possible statutory defenses (e.g. habitability repair under Marini v. Ireland, illegal late fees, landlord registration failure, or notice timelines). Calculate disputed details based on receipts, and generate an official "Draft Legal Defense Statement" the tenant can present in mediation or copy into their court Answer forms. Use clean LaTeX formatting for calculations if appropriate. Keep it structured and highly readable.
    
    Tenant defense inputs:
    - Court County: ${draft.courtCounty || 'Not provided'}
    - Docket Number: ${draft.docketNumber || 'Not provided'}
    - Landlord Name: ${draft.landlordName || 'Not provided'}
    - Tenant Names: ${draft.tenantNames || 'Not provided'}
    - Notice Title: ${draft.noticeTitle || 'Not provided'}
    - Service details: ${draft.complaintReceived || 'Not provided'}
    - Rent Claimed by Landlord: $${draft.rentClaimed || '0'}
    - Disputed Rent Reason: ${draft.rentDisputed || 'Not provided'}
    - Housing Conditions & Repair Issue: ${draft.repairs || 'Not provided'}
    - Service of Process Concerns: ${draft.serviceConcern || 'Not provided'}
    - Extra Story/Details: ${draft.story || 'Not provided'}
    - Calculation Stats: Landlord claims $${claimedVal}, tenant records show total paid $${totalPaid} and repair deductions of $${totalRepairs}, leaving outstanding $${outstanding}.`

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: promptText,
          history: [],
          lang: isSpanish ? 'es' : 'en'
        })
      })

      if (!res.ok) throw new Error(`Status ${res.status}`)
      const data = await res.json()
      setAuditResult(data.reply)
    } catch (e) {
      setAuditError(isSpanish 
        ? 'No se pudo generar la auditoría de defensa de IA. Asegúrese de que el servidor local esté funcionando.'
        : 'Could not generate the AI defense audit. Make sure the backend server is running.'
      )
    } finally {
      setAuditLoading(false)
    }
  }

  const labelTranslations: Record<string, string> = {
    court_check_county: t('en') === 'en' ? 'County shown on the court papers' : 'Condado indicado en los papeles de la corte',
    court_check_docket: t('en') === 'en' ? 'Docket number' : 'Número de expediente (Docket number)',
    court_check_date: t('en') === 'en' ? 'Court date, if shown' : 'Fecha de la corte, si se indica',
    court_check_landlord: t('en') === 'en' ? 'Landlord or plaintiff name' : 'Nombre del arrendador o demandante',
    court_check_tenant: t('en') === 'en' ? 'Tenant or defendant names' : 'Nombres de los inquilinos o demandados',
    court_check_notice_title: t('en') === 'en' ? 'Exact title of the first notice received' : 'Título exacto del primer aviso recibido',
    court_check_notice_date: t('en') === 'en' ? 'Date on that notice' : 'Fecha en ese aviso',
    court_check_how_received: t('en') === 'en' ? 'How and when did you receive the complaint and summons?' : '¿Cómo y cuándo recibió la demanda y la citación?',
    calc_landlord_claim: t('calc_landlord_claim'),
    court_check_rent_disputed: t('en') === 'en' ? 'What, if anything, do you disagree with about that amount?' : '¿Con qué no está de acuerdo sobre ese monto?',
    court_check_repairs: t('en') === 'en' ? 'Describe important repair or housing-condition issues and when you reported them' : 'Describa problemas de reparación o condiciones de la vivienda y cuándo los reportó',
    court_check_service_concern: t('en') === 'en' ? 'Describe any concern about how notices or court papers were delivered' : 'Describa preocupaciones sobre cómo le entregaron los avisos o papeles de la corte',
    court_check_story: t('en') === 'en' ? 'What else should a legal-aid attorney know?' : '¿Qué más debería saber un abogado de ayuda legal?'
  }

  const sections = [...new Set(fields.map(f => f.section))]

  function clear() {
    setDraft(emptyDraft)
    setAck(false)
    setGenerated(false)
    setAuditResult('')
    setAuditLoading(false)
    setAuditError('')
  }

  async function generate() {
    setGenerated(true)
    await recordEvent({
      eventType: 'draft_generated',
      county: draft.courtCounty || undefined,
      outcome: 'review_packet'
    })
    setTimeout(() => document.getElementById('draft-packet')?.scrollIntoView({ behavior: 'smooth' }), 0)
  }

  const claimedVal = parseFloat(draft.rentClaimed) || 0
  const totalPaid = draft.rentPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
  const totalRepairs = draft.repairDeductions.reduce((sum, r) => sum + (parseFloat(r.cost) || 0), 0)
  const outstanding = claimedVal - totalPaid - totalRepairs

  function addPayment() {
    setDraft(prev => ({
      ...prev,
      rentPayments: [...prev.rentPayments, { date: '', amount: '', method: '', notes: '' }]
    }))
  }

  function removePayment(index: number) {
    setDraft(prev => ({
      ...prev,
      rentPayments: prev.rentPayments.filter((_, i) => i !== index)
    }))
  }

  function updatePayment(index: number, key: keyof RentPayment, value: string) {
    setDraft(prev => ({
      ...prev,
      rentPayments: prev.rentPayments.map((p, i) => i === index ? { ...p, [key]: value } : p)
    }))
  }

  function addRepair() {
    setDraft(prev => ({
      ...prev,
      repairDeductions: [...prev.repairDeductions, { date: '', item: '', cost: '', notifiedDate: '' }]
    }))
  }

  function removeRepair(index: number) {
    setDraft(prev => ({
      ...prev,
      repairDeductions: prev.repairDeductions.filter((_, i) => i !== index)
    }))
  }

  function updateRepair(index: number, key: keyof RepairDeduction, value: string) {
    setDraft(prev => ({
      ...prev,
      repairDeductions: prev.repairDeductions.map((r, i) => i === index ? { ...r, [key]: value } : r)
    }))
  }

  return (
    <section className="shell page-section">
      <PageIntro eyebrow={t('packet_intro_eyebrow')} title={t('packet_intro_title')}>
        <p>{t('packet_intro_desc')}</p>
      </PageIntro>

      <div className="legal-gate bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-8 text-sm flex items-start gap-2.5 rounded-r">
        <WarningIcon className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
        <div>
          <strong>{t('packet_gate')}</strong>
          <p className="mt-1">{t('packet_gate_desc')}</p>
        </div>
      </div>

      {!generated ? (
        <form className="interview space-y-8" onSubmit={e => { e.preventDefault(); generate() }}>
          {sections.map(section => (
            <fieldset key={section} className="border border-rule rounded-lg p-6 bg-paper/50 shadow-2xs">
              <legend className="px-2.5 py-0.5 rounded bg-ink text-paper font-bold text-xs uppercase tracking-wider">{section === 'Court and parties' ? (t('en') === 'en' ? 'Court and Parties' : 'Corte y Partes') : section === 'Papers received' ? (t('en') === 'en' ? 'Papers Received' : 'Papeles Recibidos') : (t('en') === 'en' ? 'Facts to Review' : 'Hechos a Revisar')}</legend>
              <div className="grid gap-6 md:grid-cols-2 mt-4">
                {fields
                  .filter(f => f.section === section)
                  .map(field => (
                    <label key={field.key} className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
                      {labelTranslations[field.labelKey]}
                      {field.key === 'story' || field.key === 'repairs' || field.key === 'serviceConcern' || field.key === 'complaintReceived' || field.key === 'rentDisputed' ? (
                        <textarea
                          value={draft[field.key] as string}
                          onChange={e => setDraft({ ...draft, [field.key]: e.target.value })}
                          rows={3}
                          className="mt-1 font-normal w-full p-2.5 border border-rule rounded bg-paper"
                        />
                      ) : (
                        <input
                          type={field.type || 'text'}
                          value={draft[field.key] as string}
                          onChange={e => setDraft({ ...draft, [field.key]: e.target.value })}
                          className="mt-1 font-normal w-full p-2.5 border border-rule rounded bg-paper"
                        />
                      )}
                    </label>
                  ))}
              </div>
            </fieldset>
          ))}

          {/* Interactive Calculator Section */}
          <div className="border border-rule rounded-lg p-6 bg-paper/50 space-y-6 shadow-2xs">
            <h2 className="text-xl font-bold border-b border-rule pb-3 text-ink">{t('calc_rent_ledger_title')}</h2>
            <p className="text-sm text-margin">{t('calc_rent_ledger_desc')}</p>

            {/* Rent Payments History */}
            <div className="space-y-4">
              <h3 className="text-md font-bold text-ink">{t('calc_payment_history')}</h3>
              
              {draft.rentPayments.map((payment, idx) => (
                <div key={idx} className="grid gap-3 sm:grid-cols-4 items-end bg-rule/10 p-4 rounded-lg relative border border-rule/30 shadow-3xs">
                  <button
                    type="button"
                    onClick={() => removePayment(idx)}
                    className="absolute top-2.5 right-2.5 text-red-600 hover:text-red-800 p-1.5 rounded-full hover:bg-red-50 cursor-pointer active:scale-90 transition"
                    title="Remove Payment"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                  <label className="text-xs font-semibold text-ink">
                    {t('calc_payment_date')}
                    <input
                      type="date"
                      value={payment.date}
                      onChange={e => updatePayment(idx, 'date', e.target.value)}
                      className="mt-1 font-normal w-full p-2 border border-rule bg-paper rounded-md"
                    />
                  </label>
                  <label className="text-xs font-semibold text-ink">
                    {t('calc_payment_amount')}
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={payment.amount}
                      onChange={e => updatePayment(idx, 'amount', e.target.value)}
                      className="mt-1 font-normal w-full p-2 border border-rule bg-paper rounded-md"
                    />
                  </label>
                  <label className="text-xs font-semibold text-ink">
                    {t('calc_payment_method')}
                    <input
                      type="text"
                      placeholder="Venmo, Check, Cash"
                      value={payment.method}
                      onChange={e => updatePayment(idx, 'method', e.target.value)}
                      className="mt-1 font-normal w-full p-2 border border-rule bg-paper rounded-md"
                    />
                  </label>
                  <label className="text-xs font-semibold text-ink pr-8">
                    {t('calc_disputed_notes')}
                    <input
                      type="text"
                      placeholder="Explain dispute"
                      value={payment.notes}
                      onChange={e => updatePayment(idx, 'notes', e.target.value)}
                      className="mt-1 font-normal w-full p-2 border border-rule bg-paper rounded-md"
                    />
                  </label>
                </div>
              ))}

              <button
                type="button"
                onClick={addPayment}
                className="action-btn text-xs py-2 px-3 rounded-md cursor-pointer active:scale-95 transition flex items-center gap-1.5 font-semibold"
              >
                <PlusIcon className="w-4 h-4" />
                {t('btn_add_row')}
              </button>
            </div>

            {/* Repair Offsets (Marini) */}
            <div className="space-y-4 pt-6 border-t border-rule">
              <h3 className="text-md font-bold text-ink">{t('calc_repair_deductions_title')}</h3>
              <p className="text-xs text-margin">{t('calc_repair_deductions_desc')}</p>

              {draft.repairDeductions.map((repair, idx) => (
                <div key={idx} className="grid gap-3 sm:grid-cols-4 items-end bg-rule/10 p-4 rounded-lg relative border border-rule/30 shadow-3xs">
                  <button
                    type="button"
                    onClick={() => removeRepair(idx)}
                    className="absolute top-2.5 right-2.5 text-red-600 hover:text-red-800 p-1.5 rounded-full hover:bg-red-50 cursor-pointer active:scale-90 transition"
                    title="Remove Repair"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                  <label className="text-xs font-semibold text-ink">
                    {t('calc_repair_date')}
                    <input
                      type="date"
                      value={repair.date}
                      onChange={e => updateRepair(idx, 'date', e.target.value)}
                      className="mt-1 font-normal w-full p-2 border border-rule bg-paper rounded-md"
                    />
                  </label>
                  <label className="text-xs font-semibold sm:col-span-2 text-ink">
                    {t('calc_repair_item')}
                    <input
                      type="text"
                      placeholder="e.g. Fixed heater plumbing"
                      value={repair.item}
                      onChange={e => updateRepair(idx, 'item', e.target.value)}
                      className="mt-1 font-normal w-full p-2 border border-rule bg-paper rounded-md"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-2 items-end pr-8">
                    <label className="text-xs font-semibold text-ink">
                      {t('calc_repair_cost')}
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={repair.cost}
                        onChange={e => updateRepair(idx, 'cost', e.target.value)}
                        className="mt-1 font-normal w-full p-2 border border-rule bg-paper rounded-md"
                      />
                    </label>
                    <label className="text-xs font-semibold text-ink">
                      {t('calc_repair_notified')}
                      <input
                        type="date"
                        value={repair.notifiedDate}
                        onChange={e => updateRepair(idx, 'notifiedDate', e.target.value)}
                        className="mt-1 font-normal w-full p-2 border border-rule bg-paper rounded-md"
                      />
                    </label>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addRepair}
                className="action-btn text-xs py-2 px-3 rounded-md cursor-pointer active:scale-95 transition flex items-center gap-1.5 font-semibold"
              >
                <PlusIcon className="w-4 h-4" />
                {t('btn_add_row')}
              </button>
            </div>

            {/* Calculations Summary Box */}
            <div className="bg-ink text-paper rounded-lg p-5 mt-6 grid gap-4 sm:grid-cols-4 text-center">
              <div>
                <p className="text-xs text-paper/70 font-semibold uppercase tracking-wider">{t('calc_total_claimed')}</p>
                <strong className="text-lg">${claimedVal.toFixed(2)}</strong>
              </div>
              <div>
                <p className="text-xs text-paper/70 font-semibold uppercase tracking-wider">{t('calc_total_paid')}</p>
                <strong className="text-lg text-green-300">-${totalPaid.toFixed(2)}</strong>
              </div>
              <div>
                <p className="text-xs text-paper/70 font-semibold uppercase tracking-wider">{t('calc_total_repairs')}</p>
                <strong className="text-lg text-yellow-300">-${totalRepairs.toFixed(2)}</strong>
              </div>
              <div className="border-t sm:border-t-0 sm:border-l border-paper/20 pt-4 sm:pt-0">
                <p className="text-xs text-paper/70 font-semibold uppercase tracking-wider">{t('calc_outstanding')}</p>
                <strong className={`text-xl ${outstanding <= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  ${outstanding.toFixed(2)}
                </strong>
              </div>
              <p className="col-span-full text-left text-2xs text-paper/50 italic mt-2">
                * {t('calc_outstanding_help')}
              </p>
            </div>

            {totalRepairs > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-xs text-red-950 flex items-start gap-2.5 shadow-2xs">
                <WarningIcon className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-red-900 mb-1">
                    {t('calc_escrow_warning_title')}
                  </h4>
                  <p className="leading-relaxed text-margin">
                    {t('calc_escrow_warning_desc').replace('${amount}', outstanding > 0 ? outstanding.toFixed(2) : '0.00')}
                  </p>
                </div>
              </div>
            )}
          </div>

          <label className="ack-row flex items-start gap-3 py-2 cursor-pointer font-semibold text-sm select-none">
            <input
              type="checkbox"
              checked={ack}
              onChange={e => setAck(e.target.checked)}
              className="mt-1"
            />
            <span>{t('packet_ack')}</span>
          </label>
          <button className="primary-cta w-full py-3.5 flex items-center justify-center gap-1 active:scale-97 transition font-bold" disabled={!ack}>
            <PlusIcon className="w-5 h-5" />
            {t('packet_create_btn')}
          </button>
        </form>
      ) : (
        <article id="draft-packet" className="draft-packet relative bg-paper border-2 border-ink p-8 rounded-lg shadow-md max-w-4xl mx-auto">
          <header className="border-b-2 border-ink pb-6 mb-8 text-center sm:text-left">
            <p className="eyebrow uppercase tracking-widest">{t('packet_confidential')}</p>
            <h2 className="text-2xl font-bold mt-2 text-ink">{t('packet_summary_title')}</h2>
          </header>

          <div className="space-y-8">
            {sections.map(section => (
              <section key={section} className="border-b border-rule pb-6">
                <h3 className="text-lg font-bold mb-4 uppercase tracking-wider text-ink">{section === 'Court and parties' ? (t('en') === 'en' ? 'Court and Parties' : 'Corte y Partes') : section === 'Papers received' ? (t('en') === 'en' ? 'Papers Received' : 'Papeles Recibidos') : (t('en') === 'en' ? 'Facts to Review' : 'Hechos a Revisar')}</h3>
                <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                  {fields
                    .filter(f => f.section === section)
                    .map(field => (
                      <div key={field.key} className="border-b border-rule/50 pb-2">
                        <dt className="text-xs font-bold text-margin uppercase">{labelTranslations[field.labelKey]}</dt>
                        <dd className="mt-1 text-sm font-normal white-space-pre-wrap text-ink">{draft[field.key] as string || t('not_answered')}</dd>
                      </div>
                    ))}
                </dl>
              </section>
            ))}
          </div>

          <section className="border-b border-rule pb-6 pt-6">
            <h3 className="text-lg font-bold mb-4 uppercase tracking-wider text-ink">{t('en') === 'en' ? 'Payment & Repair Deduction History' : 'Historial de Pagos y Deducciones por Reparación'}</h3>
            
            <div className="ledger-tables space-y-6">
              <div>
                <h4 className="text-sm font-bold text-margin mb-2 uppercase">{t('calc_payment_history')}</h4>
                <table className="w-full text-left text-xs border border-rule">
                  <thead className="bg-rule/20">
                    <tr>
                      <th className="p-2 border-b border-rule">{t('calc_payment_date')}</th>
                      <th className="p-2 border-b border-rule">{t('calc_payment_amount')}</th>
                      <th className="p-2 border-b border-rule">{t('calc_payment_method')}</th>
                      <th className="p-2 border-b border-rule">{t('calc_disputed_notes')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {draft.rentPayments.length ? draft.rentPayments.map((p, idx) => (
                      <tr key={idx} className="border-b border-rule/50">
                        <td className="p-2 font-mono">{p.date || '-'}</td>
                        <td className="p-2 font-semibold text-ink">${parseFloat(p.amount).toFixed(2) || '0.00'}</td>
                        <td className="p-2 text-ink">{p.method || '-'}</td>
                        <td className="p-2 italic text-margin">{p.notes || '-'}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-margin italic">{t('not_answered')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div>
                <h4 className="text-sm font-bold text-margin mb-2 uppercase">{t('calc_repair_deductions_title')}</h4>
                <table className="w-full text-left text-xs border border-rule">
                  <thead className="bg-rule/20">
                    <tr>
                      <th className="p-2 border-b border-rule">{t('calc_repair_date')}</th>
                      <th className="p-2 border-b border-rule">{t('calc_repair_item')}</th>
                      <th className="p-2 border-b border-rule">{t('calc_repair_cost')}</th>
                      <th className="p-2 border-b border-rule">{t('calc_repair_notified')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {draft.repairDeductions.length ? draft.repairDeductions.map((r, idx) => (
                      <tr key={idx} className="border-b border-rule/50">
                        <td className="p-2 font-mono">{r.date || '-'}</td>
                        <td className="p-2 text-ink">{r.item || '-'}</td>
                        <td className="p-2 font-semibold text-ink">${parseFloat(r.cost).toFixed(2) || '0.00'}</td>
                        <td className="p-2 font-mono">{r.notifiedDate || '-'}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-margin italic">{t('not_answered')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-rule/20 border border-rule rounded-lg p-4 max-w-sm ml-auto space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>{t('calc_total_claimed')}:</span>
                  <span className="font-semibold">${claimedVal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-800 font-medium">
                  <span>{t('calc_total_paid')}:</span>
                  <span className="font-semibold">-${totalPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-yellow-800 font-medium">
                  <span>{t('calc_total_repairs')}:</span>
                  <span className="font-semibold">-${totalRepairs.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-rule pt-2 font-bold text-sm text-ink">
                  <span>{t('calc_outstanding')}:</span>
                  <span>${outstanding.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="border-b border-rule pb-6 pt-6">
            <h3 className="text-md font-bold text-ink">{t('packet_prompts_title')}</h3>
            <p className="text-xs text-margin mb-3">{t('packet_prompts_desc')}</p>
            <ul className="list-disc pl-5 text-sm space-y-2 text-margin/90">
              {reviewPrompts.map(item => (
                <li key={item}>
                  {t('en') === 'en' ? item : item === 'Whether every required notice was served correctly and on time.' 
                    ? 'Si cada aviso requerido se entregó de forma correcta y a tiempo.'
                    : item === 'Whether the amount of rent claimed matches your records.'
                    ? 'Si el monto de alquiler reclamado coincide con sus registros.'
                    : item === 'Whether housing conditions, repair requests, or retaliation affect the case.'
                    ? 'Si las condiciones de la vivienda, solicitudes de reparación o represalias afectan el caso.'
                    : 'Si la demanda y citación fueron entregadas utilizando el procedimiento requerido.'}
                </li>
              ))}
            </ul>
          </section>

          {/* AI Audit section */}
          {(auditLoading || auditResult || auditError) && (
            <section className="border-t border-rule mt-8 pt-6">
              <h3 className="text-lg font-bold mb-4 uppercase tracking-wider text-ink flex items-center gap-2">
                <SparkleIcon className="w-5 h-5 text-ink" />
                <span>{t('en') === 'en' ? 'AI Legal Defense Audit' : 'Auditoría de Defensa de la IA'}</span>
              </h3>
              
              {auditLoading && (
                <div className="p-4 bg-rule/10 rounded-lg animate-pulse text-xs text-margin">
                  {t('en') === 'en' ? 'Analyzing your packet details under NJ law. This takes about 10 seconds...' : 'Analizando los detalles de su paquete bajo la ley de NJ. Esto toma unos 10 segundos...'}
                </div>
              )}

              {auditError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
                  {auditError}
                </div>
              )}

              {auditResult && (
                <div className="p-5 bg-rule/10 border border-rule/60 rounded-xl text-xs text-ink leading-relaxed space-y-2 prose">
                  {formatMessage(auditResult)}
                </div>
              )}
            </section>
          )}

          <section className="pt-6 border-t border-rule mt-8">
            <h3 className="text-md font-bold text-ink">{t('packet_next_steps')}</h3>
            <ol className="list-decimal pl-5 text-sm space-y-2 mt-3 text-margin/90">
              <li>{t('packet_next_1')}</li>
              <li>{t('packet_next_2')}</li>
              <li>{t('packet_next_3')}</li>
            </ol>
            <a 
              href="https://www.njcourts.gov/self-help/landlord-tenant" 
              target="_blank" 
              rel="noreferrer" 
              className="text-link mt-4 inline-block font-semibold text-sm"
            >
              {t('packet_nj_courts_link')}
            </a>
          </section>

          <div className="draft-actions print-hide flex flex-wrap gap-3 mt-8 pt-6 border-t border-rule">
            <button 
              onClick={runAudit} 
              disabled={auditLoading} 
              className="primary-cta py-3 px-6 flex items-center gap-1.5 active:scale-97 transition font-bold"
              style={{ background: '#3D6B52', borderColor: '#3D6B52' }}
            >
              <SparkleIcon className="w-5 h-5 text-white" />
              {t('en') === 'en' ? 'AI Legal Defense Audit' : 'Auditoría de Defensa de la IA'}
            </button>
            <button onClick={() => window.print()} className="primary-cta py-3 px-6 flex items-center gap-1.5 active:scale-97 transition font-bold">
              <PrintIcon className="w-5 h-5" />
              {t('btn_print')} {t('nav_prepare_packet')}
            </button>
            <button onClick={() => setGenerated(false)} className="action-btn py-3 px-6 rounded-md flex items-center gap-1.5 active:scale-97 transition font-semibold">
              <BackIcon className="w-5 h-5" />
              {t('packet_edit_btn')}
            </button>
            <button onClick={clear} className="action-btn py-3 px-6 rounded-md text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-1.5 active:scale-97 transition font-semibold">
              <TrashIcon className="w-5 h-5" />
              {t('packet_clear_btn')}
            </button>
          </div>
        </article>
      )}
    </section>
  )
}
