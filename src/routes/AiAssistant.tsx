import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageIntro, useTranslation, WarningIcon, PhoneIcon, DirectionsIcon, ShieldIcon, DocumentIcon, ScalesIcon, CourthouseIcon, MediationIcon, SparkleIcon } from '../components'
import { legalAidOffices } from '../data/legalAid'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function SendIcon({ className = 'w-5 h-5' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  )
}

const SUGGESTED_QUESTIONS_EN = [
  'My landlord locked me out today — is this legal?',
  'What is a Notice to Quit and how long do I have?',
  'Can I withhold rent because my heat is broken?',
  'What happens if I miss my court date?',
  'What should I say at mediation to stay in my home?',
  'My landlord raised my rent by 30%. Is that legal in NJ?',
]

const SUGGESTED_QUESTIONS_ES = [
  '¿Mi arrendador me cambió las llaves hoy — es eso legal?',
  '¿Qué es un Aviso de Desalojo y cuánto tiempo tengo?',
  '¿Puedo retener el alquiler porque no tengo calefacción?',
  '¿Qué pasa si no voy a la audiencia en la corte?',
  '¿Qué debo decir en la mediación para quedarme en mi hogar?',
  '¿Mi arrendador subió el alquiler un 30%. ¿Es legal en NJ?',
]

export function AiAssistant() {
  const { lang } = useTranslation()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedCounty, setSelectedCounty] = useState<string>('')
  
  const [checklist, setChecklist] = useState<{ id: string; text: string; checked: boolean }[]>([
    {
      id: 'default-1',
      text: lang === 'es'
        ? 'Reúna su contrato de arrendamiento por escrito y los avisos del arrendador.'
        : 'Gather your written lease agreement and landlord notices.',
      checked: false
    },
    {
      id: 'default-2',
      text: lang === 'es'
        ? 'Recopile recibos y registros de todos los pagos de alquiler.'
        : 'Collect receipts and ledger logs for all rent payments.',
      checked: false
    },
    {
      id: 'default-3',
      text: lang === 'es'
        ? 'Fotografíe cualquier condición dañada en su propiedad de alquiler.'
        : 'Photograph any broken conditions in your rental property.',
      checked: false
    },
    {
      id: 'default-4',
      text: lang === 'es'
        ? 'Llame a LSNJLAW (1-888-576-5529) para solicitar ayuda legal.'
        : 'Call LSNJLAW (1-888-576-5529) to request legal aid representation.',
      checked: false
    }
  ])

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const suggestedQuestions = lang === 'es' ? SUGGESTED_QUESTIONS_ES : SUGGESTED_QUESTIONS_EN

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function parseChecklistTasks(text: string) {
    const lines = text.split('\n')
    const actionWords = ['file', 'call', 'contact', 'gather', 'prepare', 'deposit', 'submit', 'photograph', 'document', 'negotiate', 'reach', 'pay', 'consult', 'go', 'write', 'report', 'present', 'presentar', 'llamar', 'recopilar', 'fotografiar', 'documentar', 'pagar', 'consultar', 'depositar']
    const newTasks: { id: string; text: string; checked: boolean }[] = []
    
    lines.forEach((line, index) => {
      const trimmed = line.trim()
      const isList = trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ') || trimmed.match(/^\d+\.\s/)
      if (!isList) return
      
      const cleanText = trimmed.replace(/^([-•*]|\d+\.)\s+/, '').trim()
      if (cleanText.length < 15 || cleanText.length > 200) return
      
      const words = cleanText.toLowerCase().split(/\s+/)
      const hasAction = words.some(w => actionWords.includes(w))
      if (hasAction) {
        newTasks.push({
          id: `task-${Date.now()}-${index}`,
          text: cleanText,
          checked: false
        })
      }
    })
    
    if (newTasks.length > 0) {
      setChecklist(prev => {
        const existingTexts = prev.map(t => t.text.toLowerCase())
        const filteredNew = newTasks.filter(n => !existingTexts.includes(n.text.toLowerCase()))
        return [...prev, ...filteredNew]
      })
    }
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: Message = { role: 'user', content: trimmed }
    const newHistory = [...messages, userMsg]
    setMessages(newHistory)
    setInput('')
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: messages.slice(-10),
          lang
        })
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `Server error ${res.status}`)
      }
      const data = await res.json()
      setMessages([...newHistory, { role: 'assistant', content: data.reply }])
      parseChecklistTasks(data.reply)
    } catch (err: any) {
      setError(err.message || (lang === 'es'
        ? 'Error al conectar con el asistente. Por favor intente de nuevo.'
        : 'Could not reach the AI assistant. Please try again.'))
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function renderInlineContent(content: string) {
    // Matches LaTeX blocks, LaTeX inline, markdown bold, and markdown italic
    const regex = /(\\\[[\s\S]*?\\\]|\\\(.*?\\\)|(?:\*\*.*?\*\*)|(?:\*.*?\*))/g
    const parts = content.split(regex)

    return parts.map((part, idx) => {
      if (part.startsWith('\\[') && part.endsWith('\\]')) {
        const formula = part.slice(2, -2).trim()
        return (
          <div key={idx} className="my-3 p-3 bg-ink/5 border-l-2 border-margin rounded-r font-mono text-xs overflow-x-auto text-center block-latex">
            {formula}
          </div>
        )
      }
      if (part.startsWith('\\(') && part.endsWith('\\)')) {
        const formula = part.slice(2, -2).trim()
        return (
          <span key={idx} className="inline-block px-1.5 py-0.5 mx-0.5 bg-ink/5 rounded font-mono text-xs text-margin font-semibold">
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
      if (!trimmed) return <div key={lineIdx} className="h-2" />

      // Headers
      if (trimmed.startsWith('### ')) {
        return <h4 key={lineIdx} className="font-bold text-[15px] text-ink mt-3 mb-1 uppercase tracking-wider">{renderInlineContent(trimmed.slice(4))}</h4>
      }
      if (trimmed.startsWith('## ')) {
        return <h3 key={lineIdx} className="font-bold text-[17px] text-ink mt-4 mb-2">{renderInlineContent(trimmed.slice(3))}</h3>
      }
      if (trimmed.startsWith('# ')) {
        return <h2 key={lineIdx} className="font-bold text-[19px] text-ink mt-4 mb-2">{renderInlineContent(trimmed.slice(2))}</h2>
      }

      // Unordered list items
      if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
        return <li key={lineIdx} className="ml-4 list-disc text-[15px] leading-relaxed mb-1">{renderInlineContent(trimmed.slice(2))}</li>
      }

      // Ordered list items
      const numMatch = trimmed.match(/^(\d+)\.\s(.*)/)
      if (numMatch) {
        return (
          <div key={lineIdx} className="flex gap-2 text-[15px] leading-relaxed mb-1 ml-2">
            <span className="font-semibold text-margin">{numMatch[1]}.</span>
            <div className="flex-1">{renderInlineContent(numMatch[2])}</div>
          </div>
        )
      }

      // Standard paragraph
      return <p key={lineIdx} className="text-[15px] leading-relaxed mb-2">{renderInlineContent(line)}</p>
    })
  }

  return (
    <section className="shell page-section">
      <PageIntro
        eyebrow={lang === 'es' ? 'Asistente legal IA · Gratis' : 'AI Legal Assistant · Free'}
        title={lang === 'es' ? 'Pregúntale a tu asistente de derechos NJ' : 'Ask your NJ Rights Assistant'}
      >
        <p className="text-sm text-margin">
          {lang === 'es'
            ? 'Haga cualquier pregunta sobre sus derechos de inquilino en Nueva Jersey. Respuestas instantáneas basadas en la ley de NJ — disponibles 24/7, en inglés y español.'
            : 'Ask any question about your New Jersey tenant rights. Instant answers grounded in NJ law — available 24/7 in English and Spanish.'}
        </p>
      </PageIntro>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 mb-8">
        <WarningIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block mb-0.5">
            {lang === 'es' ? 'Información, no asesoramiento legal' : 'General information, not legal advice'}
          </strong>
          {lang === 'es'
            ? 'Este asistente brinda información general sobre la ley de NJ. Para asesoramiento legal oficial, llame a LSNJLAW al '
            : 'This assistant provides general NJ law information. For official legal advice, call LSNJLAW at '}
          <a href="tel:18885765529" className="font-bold underline">1-888-576-5529</a>.
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        {/* Chat Window */}
        <div className="flex flex-col">
          <div className="ai-chat-window flex flex-col gap-4 min-h-[620px] max-h-[80vh] overflow-y-auto border border-rule rounded-xl p-5 bg-paper/60 shadow-3xs">
            {messages.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center gap-4">
                <div className="p-4 rounded-full bg-ink/5">
                  <SparkleIcon className="w-8 h-8 text-margin" />
                </div>
                <div>
                  <p className="font-semibold text-ink">
                    {lang === 'es' ? '¿Cómo puedo ayudarte hoy?' : 'How can I help you today?'}
                  </p>
                  <p className="text-[15px] text-margin/80 mt-1 max-w-[320px] mx-auto leading-relaxed">
                    {lang === 'es'
                      ? 'Pregunte sobre su aviso de desalojo, sus derechos o el proceso judicial.'
                      : 'Ask about your eviction notice, your rights, or the court process.'}
                  </p>
                </div>
                {/* Suggested quick questions */}
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {suggestedQuestions.slice(0, 3).map(q => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => sendMessage(q)}
                      className="text-xs px-3 py-2.5 rounded-lg border border-rule bg-paper hover:bg-rule/20 hover:border-ink/40 text-ink transition cursor-pointer active:scale-95 text-left font-semibold"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="shrink-0 mt-1 w-7 h-7 rounded-full bg-ink flex items-center justify-center">
                    <SparkleIcon className="w-3.5 h-3.5 text-paper" />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-ink text-paper rounded-tr-sm shadow-3xs'
                    : 'bg-rule/20 text-ink border border-rule/60 rounded-tl-sm'
                }`}>
                  {msg.role === 'assistant'
                    ? <div className="space-y-0.5">{formatMessage(msg.content)}</div>
                    : <p>{msg.content}</p>
                  }
                </div>
                {msg.role === 'user' && (
                  <div className="shrink-0 mt-1 w-7 h-7 rounded-full bg-stamp/20 border border-stamp/40 flex items-center justify-center text-xs font-bold text-stamp">
                    U
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="shrink-0 mt-1 w-7 h-7 rounded-full bg-ink flex items-center justify-center">
                  <SparkleIcon className="w-3.5 h-3.5 text-paper" />
                </div>
                <div className="bg-rule/20 border border-rule/60 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1.5 items-center h-4">
                    <span className="w-2 h-2 rounded-full bg-margin/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-margin/60 animate-bounce" style={{ animationDelay: '120ms' }} />
                    <span className="w-2 h-2 rounded-full bg-margin/60 animate-bounce" style={{ animationDelay: '240ms' }} />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
                <WarningIcon className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Bar */}
          <div className="mt-4 flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault()
                  sendMessage(input)
                }
              }}
              disabled={loading}
              rows={2}
              placeholder={lang === 'es'
                ? 'Escriba su pregunta sobre sus derechos de inquilino...'
                : 'Ask about your tenant rights, eviction notice, or court process...'}
              className="flex-1 resize-none p-3 border border-rule rounded-xl text-[15px] bg-paper focus:outline-none focus:border-ink transition"
            />
            <button
              type="button"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="self-end px-4 py-3 rounded-xl bg-ink text-paper font-semibold text-sm cursor-pointer hover:bg-margin active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <SendIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{lang === 'es' ? 'Enviar' : 'Send'}</span>
            </button>
          </div>
          <p className="mt-2 text-xs text-margin/60 text-center font-medium">
            {lang === 'es' ? 'Presione Enter para enviar · Shift+Enter para nueva línea' : 'Press Enter to send · Shift+Enter for new line'}
          </p>
        </div>

        {/* Sidebar Eviction Defense Dashboard */}
        <div className="flex flex-col gap-6">
          {/* Action Checklist */}
          <div className="border border-rule rounded-xl p-4 bg-paper/40 shadow-3xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-margin mb-3 flex items-center gap-2">
              <DocumentIcon className="w-4 h-4 text-margin" />
              <span>{lang === 'es' ? 'Mi Lista de Acciones' : 'My Action Checklist'}</span>
            </h3>
            <p className="text-[10px] text-margin/70 mb-3 leading-relaxed">
              {lang === 'es'
                ? 'Las tareas se extraen automáticamente de los consejos de la IA arriba.'
                : 'Tasks are automatically extracted from the AI answers above.'}
            </p>
            <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
              {checklist.map(item => (
                <label key={item.id} className="flex items-start gap-2.5 text-xs text-ink/85 select-none cursor-pointer hover:text-ink leading-relaxed">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => {
                      setChecklist(prev => prev.map(t => t.id === item.id ? { ...t, checked: !t.checked } : t))
                    }}
                    className="mt-0.5 rounded border-rule text-ink focus:ring-ink"
                  />
                  <span>{item.text}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Courthouse Locator */}
          <div className="border border-rule rounded-xl p-4 bg-paper/40 shadow-3xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-margin mb-3 flex items-center gap-2">
              <CourthouseIcon className="w-4 h-4 text-margin" />
              <span>{lang === 'es' ? 'Localizador de Tribunales' : 'Courthouse Locator'}</span>
            </h3>
            <select
              value={selectedCounty}
              onChange={e => setSelectedCounty(e.target.value)}
              className="w-full text-xs p-2 border border-rule rounded-lg bg-paper focus:outline-none focus:border-ink mb-3 font-semibold text-ink"
            >
              <option value="">{lang === 'es' ? '-- Seleccione Condado --' : '-- Select County --'}</option>
              {[...new Set(legalAidOffices.map(o => o.county))].sort().map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {selectedCounty && (() => {
              const office = legalAidOffices.find(o => o.county === selectedCounty)
              if (!office) return null
              return (
                <div className="p-3 bg-paper border border-rule rounded-lg text-left space-y-1.5 animate-fade-in">
                  <div className="font-bold text-xs text-ink">{office.county} County</div>
                  <div className="text-margin font-semibold text-xs leading-normal">{office.organization}</div>
                  <address className="text-[11px] leading-normal text-margin/80 font-medium">{office.address}</address>
                  <a
                    href={`tel:${office.phone.replace(/-/g, '')}`}
                    className="flex items-center gap-1 font-bold text-xs text-margin underline mt-1"
                  >
                    <PhoneIcon className="w-3.5 h-3.5" />
                    {office.phone}
                  </a>
                </div>
              )
            })()}
          </div>

          {/* Fast Navigation Buttons */}
          <div className="border-2 border-ink rounded-xl p-4 bg-paper/40 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink mb-3 flex items-center gap-2">
              <SparkleIcon className="w-4 h-4 text-ink" />
              <span>{lang === 'es' ? 'Herramientas de Navegación' : 'Fast-Track Actions'}</span>
            </h3>
            <div className="flex flex-col gap-2">
              <Link
                to="/understand-your-notice"
                className="w-full text-center text-xs py-2.5 border border-rule hover:border-ink rounded-lg bg-paper font-bold hover:bg-rule/10 transition active:scale-97 text-ink flex items-center justify-center gap-1.5"
              >
                <DocumentIcon className="w-3.5 h-3.5 text-ink" />
                <span>{lang === 'es' ? 'Entender Mi Aviso' : 'Understand Notice'}</span>
              </Link>
              <Link
                to="/prepare-answer"
                className="w-full text-center text-xs py-2.5 border border-rule hover:border-ink rounded-lg bg-paper font-bold hover:bg-rule/10 transition active:scale-97 text-ink flex items-center justify-center gap-1.5"
              >
                <ScalesIcon className="w-3.5 h-3.5 text-ink" />
                <span>{lang === 'es' ? 'Crear Paquete de Defensa' : 'Draft Answer Packet'}</span>
              </Link>
              <Link
                to="/draft-letters"
                className="w-full text-center text-xs py-2.5 border border-rule hover:border-ink rounded-lg bg-paper font-bold hover:bg-rule/10 transition active:scale-97 text-ink flex items-center justify-center gap-1.5"
              >
                <DocumentIcon className="w-3.5 h-3.5 text-ink" />
                <span>{lang === 'es' ? 'Redactar Cartas' : 'Draft Landlord Letters'}</span>
              </Link>
              <Link
                to="/court-prep"
                className="w-full text-center text-xs py-2.5 border border-rule hover:border-ink rounded-lg bg-paper font-bold hover:bg-rule/10 transition active:scale-97 text-ink flex items-center justify-center gap-1.5"
              >
                <MediationIcon className="w-3.5 h-3.5 text-ink" />
                <span>{lang === 'es' ? 'Simular Mediación' : 'Practice Court Mediation'}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
