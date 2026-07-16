import { useMemo, useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { 
  Annotation, PageIntro, PrimaryLink, GlossaryTerm, useTranslation,
  HomeIcon, DocumentIcon, MapIcon, ScalesIcon, ShieldIcon, PhoneIcon,
  DirectionsIcon, CopyIcon, WarningIcon, TrashIcon, PlusIcon, PrintIcon,
  BackIcon, CheckIcon, AlertIcon, SparkleIcon, LightbulbIcon, CourthouseIcon,
  MediationIcon, MegaphoneIcon, RefreshIcon, GithubIcon
} from './components'
import { legalAidOffices } from './data/legalAid'
import { noticeTypes } from './data/notices'
import { rights } from './data/rights'
import { recordEvent } from './data/privacy'

// --- Helper Icons for Pages ---
function CameraIcon({ className = "w-5 h-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 47.85 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
    </svg>
  )
}

function CalendarIcon({ className = "w-5 h-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h12.75A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h12.75A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
    </svg>
  )
}

function GlobeIcon({ className = "w-4 h-4" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
    </svg>
  )
}
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

function SendIcon({ className = 'w-4 h-4' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  )
}

export function AiChatBox() {
  const { lang } = useTranslation()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const suggestedQuestions = lang === 'es' 
    ? [
        '¿Es legal que mi arrendador me cambie las llaves hoy?',
        '¿Qué es un Aviso de Desalojo y cuánto tiempo tengo?',
        '¿Mi arrendador puede subir el alquiler un 30% en NJ?'
      ]
    : [
        'My landlord locked me out today — is this legal?',
        'What is a Notice to Quit and how long do I have?',
        'My landlord raised my rent by 30%. Is that legal?'
      ]

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: ChatMessage = { role: 'user', content: trimmed }
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
    const regex = /(\\\[[\s\S]*?\\\]|\\\(.*?\\\)|(?:\*\*.*?\*\*)|(?:\*.*?\*))/g
    const parts = content.split(regex)

    return parts.map((part, idx) => {
      if (part.startsWith('\\[') && part.endsWith('\\]')) {
        const formula = part.slice(2, -2).trim()
        return (
          <div key={idx} className="my-2 p-2 bg-ink/5 border-l border-margin rounded-r font-mono text-[11px] overflow-x-auto text-center block-latex">
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

  return (
    <div className="flex flex-col h-[480px] bg-paper border border-rule rounded-xl shadow-xs overflow-hidden w-full">
      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-rule/5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="p-3 rounded-full bg-ink/5 mb-2">
              <SparkleIcon className="w-6 h-6 text-margin" />
            </div>
            <p className="font-bold text-xs text-ink">{lang === 'es' ? 'Chat Legal IA' : 'AI Legal Chat'}</p>
            <p className="text-[11px] text-margin/80 mt-1 max-w-[220px]">
              {lang === 'es' ? 'Haga preguntas rápidas sobre avisos, derechos o el tribunal.' : 'Ask quick questions about notice rights, landlord disputes, or court.'}
            </p>
            <div className="mt-3 flex flex-col gap-1.5 w-full">
              {suggestedQuestions.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-left text-[11px] px-3 py-1.5 rounded-lg border border-rule bg-paper hover:bg-rule/10 transition text-ink cursor-pointer active:scale-97"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-ink flex items-center justify-center">
                <SparkleIcon className="w-3 h-3 text-paper" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
              msg.role === 'user'
                ? 'bg-ink text-paper rounded-tr-none'
                : 'bg-paper text-ink border border-rule/65 rounded-tl-none'
            }`}>
              {msg.role === 'assistant' ? formatMessage(msg.content) : msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2 justify-start">
            <div className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-ink flex items-center justify-center">
              <SparkleIcon className="w-3 h-3 text-paper" />
            </div>
            <div className="bg-paper border border-rule/65 rounded-xl rounded-tl-none px-3 py-2">
              <div className="flex gap-1 items-center h-3">
                <span className="w-1.5 h-1.5 rounded-full bg-margin/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-margin/60 animate-bounce" style={{ animationDelay: '120ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-margin/60 animate-bounce" style={{ animationDelay: '240ms' }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-[11px] p-2 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-2 border-t border-rule bg-paper flex gap-1.5 items-center">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              sendMessage(input)
            }
          }}
          placeholder={lang === 'es' ? 'Pregunte al asistente...' : 'Ask the assistant...'}
          className="flex-1 p-2 border border-rule rounded-lg text-xs bg-paper focus:outline-none focus:border-ink"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          className="p-2 bg-ink text-paper rounded-lg cursor-pointer hover:bg-margin active:scale-95 disabled:opacity-45"
        >
          <SendIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export function AiMediationSimulator() {
  const { lang } = useTranslation()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [active, setActive] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function startSimulation() {
    setActive(true)
    setMessages([])
    setLoading(true)
    setError('')
    setFeedback('')

    const systemPrompt = lang === 'es'
      ? 'Vas a actuar como el abogado de un propietario de NJ en una sala de mediación. REGLAS CRÍTICAS: Habla como un abogado real en una conversación rápida. Escribe un máximo de 2 a 3 oraciones cortas. NO incluyas acciones teatrales entre paréntesis como "(sonríe)" o "(se sienta)". Saluda al inquilino presentándote como el abogado del propietario.'
      : 'You are roleplaying as a landlord\'s attorney in a NJ Special Civil Part mediation room. CRITICAL RULES: Speak like a real attorney in a fast conversation: keep your message to a maximum of 2 to 3 short sentences. Do NOT write theatrical action descriptions in parentheses. Greet the tenant with a brief introduction.'

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: systemPrompt,
          history: [],
          lang
        })
      })

      if (!res.ok) throw new Error(`Status ${res.status}`)
      const data = await res.json()
      setMessages([{ role: 'assistant', content: data.reply }])
    } catch (err) {
      setError(lang === 'es' ? 'Error al iniciar la simulación.' : 'Could not start the simulation.')
    } finally {
      setLoading(false)
    }
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: ChatMessage = { role: 'user', content: trimmed }
    const newHistory = [...messages, userMsg]
    setMessages(newHistory)
    setInput('')
    setLoading(true)
    setError('')
    setFeedback('')

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed + ' (Respond directly as the landlord\'s attorney in character. Speak like a real attorney in a fast conversation: write a maximum of 2-3 short sentences. Do NOT include action descriptions in parentheses.)',
          history: messages.slice(-8),
          lang
        })
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `Status ${res.status}`)
      }
      const data = await res.json()
      setMessages([...newHistory, { role: 'assistant', content: data.reply }])
    } catch (err: any) {
      setError(err.message || (lang === 'es' ? 'Error al enviar mensaje.' : 'Error sending message.'))
    } finally {
      setLoading(false)
    }
  }

  async function getFeedback() {
    if (messages.length < 2 || feedbackLoading) return
    setFeedbackLoading(true)
    setFeedback('')

    const feedbackPrompt = lang === 'es'
      ? 'Analiza el último mensaje del inquilino en este juego de rol de mediación. ¿Fueron engañados o firmaron un mal acuerdo? Explica en términos sencillos si cayeron en una trampa de mediación (como un Consentimiento para Sentencia) y qué derecho de NJ deberían ejercer en su lugar. Sé conciso y directo.'
      : 'Analyze the tenant\'s last response in this mediation roleplay history. Did they make a safe statement, or did they fall into an eviction trap (like agreeing to move out or signing a Consent to Judgment)? Explain in simple terms whether their statement is legally safe and what NJ rights they should claim instead (e.g. demanding a trial or paying to dismiss). Be concise.'

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: feedbackPrompt,
          history: messages,
          lang
        })
      })

      if (!res.ok) throw new Error(`Status ${res.status}`)
      const data = await res.json()
      setFeedback(data.reply)
    } catch (err) {
      setFeedback(lang === 'es' ? 'No se pudo obtener el consejo.' : 'Could not retrieve advice.')
    } finally {
      setFeedbackLoading(false)
    }
  }

  return (
    <div className="bg-paper border border-rule rounded-xl p-6 shadow-xs w-full">
      <h3 className="text-md font-bold text-ink flex items-center gap-2 mb-2">
        <MediationIcon className="w-5 h-5 text-margin" />
        <span>{lang === 'es' ? 'Simulador de Mediación IA' : 'AI Court Mediation Practice Roleplay'}</span>
      </h3>
      <p className="text-xs text-margin/80 mb-6 leading-relaxed">
        {lang === 'es'
          ? 'Practique su defensa contra el abogado del propietario en un entorno de mediación virtual. Aprenda a evitar trampas comunes que causan desalojos automáticos.'
          : 'Practice defending your rights against a virtual landlord\'s attorney. Learn how to identify and avoid common mediation traps that lead to automatic eviction.'}
      </p>

      {!active ? (
        <button
          type="button"
          onClick={startSimulation}
          className="primary-cta font-bold py-2 px-4 rounded text-xs cursor-pointer active:scale-97 transition flex items-center gap-1.5"
        >
          <SparkleIcon className="w-4 h-4 text-paper" />
          <span>{lang === 'es' ? 'Comenzar Práctica' : 'Start Practice Simulation'}</span>
        </button>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Chat pane */}
          <div className="h-[280px] overflow-y-auto border border-rule rounded-lg p-4 bg-rule/5 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-red-800 flex items-center justify-center text-4xs font-bold text-paper shrink-0">
                    LAW
                  </div>
                )}
                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-ink text-paper rounded-tr-none'
                    : 'bg-paper text-ink border border-rule/55 rounded-tl-none font-semibold'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 rounded-full bg-red-800 flex items-center justify-center text-[8px] font-bold text-paper shrink-0 animate-pulse" />
                <div className="bg-paper border border-rule/55 rounded-xl rounded-tl-none px-3 py-2">
                  <div className="flex gap-1 items-center h-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-margin/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-margin/60 animate-bounce" style={{ animationDelay: '120ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-margin/60 animate-bounce" style={{ animationDelay: '240ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* User controls */}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage(input)
                }
              }}
              placeholder={lang === 'es' ? 'Escriba su respuesta al abogado...' : 'Type your reply to the attorney...'}
              className="flex-1 p-2 border border-rule rounded-lg text-xs bg-paper focus:outline-none focus:border-ink"
            />
            <button
              type="button"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="px-4 py-2 bg-ink text-paper text-xs font-bold rounded-lg cursor-pointer hover:bg-margin active:scale-95 disabled:opacity-40"
            >
              {lang === 'es' ? 'Enviar' : 'Send'}
            </button>
          </div>

          {/* Feedback & Advisor Section */}
          <div className="flex gap-2 border-t border-rule pt-4 mt-2">
            <button
              type="button"
              onClick={getFeedback}
              disabled={messages.length < 2 || feedbackLoading || loading}
              className="px-3.5 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white font-bold text-xs rounded-lg active:scale-95 cursor-pointer disabled:opacity-40 transition flex items-center gap-1.5"
            >
              <LightbulbIcon className="w-4 h-4 text-white" />
              <span>{lang === 'es' ? '¿Cómo lo hice? (Pedir Consejo)' : 'How did I do? (Get Hint)'}</span>
            </button>
            <button
              type="button"
              onClick={startSimulation}
              className="px-3.5 py-1.5 border border-rule text-ink hover:bg-rule/10 font-semibold text-xs rounded-lg active:scale-95 cursor-pointer transition flex items-center gap-1.5"
            >
              <RefreshIcon className="w-4 h-4 text-ink" />
              <span>{lang === 'es' ? 'Reiniciar' : 'Restart'}</span>
            </button>
          </div>

          {feedbackLoading && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-900 animate-pulse">
              {lang === 'es' ? 'Analizando su respuesta...' : 'Advisor is analyzing your statement...'}
            </div>
          )}

          {feedback && (
            <div className="p-4 bg-yellow-50/60 border border-yellow-200 rounded-lg text-xs text-yellow-900 leading-relaxed font-medium animate-fade-in flex items-start gap-2.5">
              <ScalesIcon className="w-4 h-4 text-yellow-800 shrink-0 mt-0.5" />
              <div>
                <strong className="block mb-1 text-yellow-950 font-bold">{lang === 'es' ? 'Consejo del Asesor Legal de IA:' : 'AI Legal Advisor Counsel:'}</strong>
                {feedback}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function AiRentAuditor() {
  const { lang } = useTranslation()
  const [currentRent, setCurrentRent] = useState('')
  const [proposedRent, setProposedRent] = useState('')
  const [city, setCity] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [anonymousShare, setAnonymousShare] = useState(true)

  function submitAuditData(curr: number, prop: number, hikePct: number, cityVal: string) {
    try {
      const saved = localStorage.getItem('rts-rent-registry')
      const registry = saved ? JSON.parse(saved) : []
      const newEntry = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US'),
        city: cityVal,
        current: curr,
        proposed: prop,
        percentage: hikePct,
        isIllegal: hikePct > 5
      }
      registry.unshift(newEntry)
      localStorage.setItem('rts-rent-registry', JSON.stringify(registry.slice(0, 100)))
    } catch (e) {
      console.error(e)
    }
  }

  async function checkRent() {
    const curr = parseFloat(currentRent) || 0
    const prop = parseFloat(proposedRent) || 0
    if (!curr || !prop || !city.trim()) return

    setLoading(true)
    setResult('')
    setError('')

    const promptText = `Audit this proposed rent increase under NJ municipal rent control rules and state unconscionability guidelines.
    
    Details:
    - Current Rent: $${curr}
    - Proposed Rent: $${prop}
    - Municipality: ${city}
    
    Calculate the exact percentage increase. Address whether it violates the local municipal rent control guidelines for ${city} (such as Newark's CPI cap, Jersey City's 4% cap, Hoboken's CPI cap, or other NJ ordinances). Warn the tenant if the increase is unconscionable (typically over 5-10% depending on municipality) or if proper notice (30 days written notice to quit) is required. Generate a custom draft response letter they can send to the landlord. Format with clear headers and list items using LaTeX for all mathematical steps.`

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: promptText,
          history: [],
          lang: lang === 'es' ? 'es' : 'en'
        })
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `Status ${res.status}`)
      }
      const data = await res.json()
      setResult(data.reply)

      if (anonymousShare) {
        const hikePct = Math.round(((prop - curr) / curr) * 100)
        submitAuditData(curr, prop, hikePct, city)
      }
    } catch (err: any) {
      setError(err.message || (lang === 'es' 
        ? 'Error al calcular la auditoría de alquiler. Asegúrese de que el servidor local esté funcionando.'
        : 'Could not calculate the rent audit. Make sure the backend server is running.'
      ))
    } finally {
      setLoading(false)
    }
  }

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

  return (
    <div className="bg-paper border border-rule rounded-xl p-6 shadow-xs w-full space-y-4">
      <h3 className="text-md font-bold text-ink flex items-center gap-2">
        <SparkleIcon className="w-5 h-5 text-emerald-600" />
        <span>{lang === 'es' ? 'Auditor de Aumento de Alquiler de IA' : 'AI Rent Increase Auditor'}</span>
      </h3>
      <p className="text-xs text-margin/80 leading-relaxed">
        {lang === 'es'
          ? 'Calcule el porcentaje de aumento y compruebe si su arrendador cumple con los límites municipales de Nueva Jersey.'
          : 'Calculate your percentage increase and verify if your landlord complies with New Jersey municipal rent control caps.'}
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-xs font-semibold text-ink flex flex-col gap-1">
          {lang === 'es' ? 'Alquiler Mensual Actual ($)' : 'Current Monthly Rent ($)'}
          <input
            type="number"
            value={currentRent}
            onChange={e => setCurrentRent(e.target.value)}
            placeholder="e.g. 1500"
            className="p-2 border border-rule bg-paper rounded-md font-normal"
          />
        </label>
        <label className="text-xs font-semibold text-ink flex flex-col gap-1">
          {lang === 'es' ? 'Alquiler Propuesto ($)' : 'Proposed Monthly Rent ($)'}
          <input
            type="number"
            value={proposedRent}
            onChange={e => setProposedRent(e.target.value)}
            placeholder="e.g. 1650"
            className="p-2 border border-rule bg-paper rounded-md font-normal"
          />
        </label>
        <label className="text-xs font-semibold text-ink flex flex-col gap-1">
          {lang === 'es' ? 'Municipio / Ciudad' : 'Municipality / City'}
          <input
            type="text"
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="e.g. Newark, Jersey City"
            className="p-2 border border-rule bg-paper rounded-md font-normal"
          />
        </label>
      </div>

      <label className="flex items-center flex-row gap-2.5 py-1 text-2xs font-semibold text-ink select-none cursor-pointer">
        <input
          type="checkbox"
          checked={anonymousShare}
          onChange={e => setAnonymousShare(e.target.checked)}
          className="w-4 h-4 rounded border-rule text-ink focus:ring-ink"
        />
        <span>{lang === 'es' ? 'Compartir anónimamente para ayudar a otros inquilinos en mi ciudad' : 'Share anonymously to help other tenants in my city'}</span>
      </label>

      <button
        type="button"
        onClick={checkRent}
        disabled={!currentRent || !proposedRent || !city.trim() || loading}
        className="primary-cta font-bold py-2 px-4 rounded text-xs cursor-pointer active:scale-97 transition mt-2 w-full sm:w-auto"
        style={{ margin: 0 }}
      >
        {loading ? (lang === 'es' ? '⏳ Calculando...' : '⏳ Auditing...') : (lang === 'es' ? '📈 Auditar Aumento' : '📈 Run Rent Audit')}
      </button>

      {error && (
        <div className="text-[11px] p-2 bg-red-50 border border-red-200 rounded-lg text-red-800 animate-fade-in">
          {error}
        </div>
      )}

      {result && (
        <>
          <div className="p-4 bg-rule/10 border border-rule rounded-lg text-xs leading-relaxed text-ink space-y-2 mt-4 animate-fade-in">
            {formatMessage(result)}
          </div>
          
          {/* Viral Share & Advocacy Widget */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs mt-4 animate-fade-in space-y-3">
            <div className="flex items-center gap-2 text-emerald-950 font-bold">
              <MegaphoneIcon className="w-5 h-5 text-emerald-950" />
              <span>{lang === 'es' ? '¡Ayuda a que esto se vuelva viral y protege a tu comunidad!' : 'Expose Rent Hikes & Protect Your Community!'}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-900 font-medium">
              {lang === 'es'
                ? 'Comparta su resultado en las redes sociales para alertar a otros inquilinos sobre las leyes de alquiler de NJ y detener el desplazamiento injusto.'
                : 'Share your calculation on social media to alert other renters about NJ rent caps and help stop tenant displacement.'}
            </p>
            
            {(() => {
              const curr = parseFloat(currentRent) || 0
              const prop = parseFloat(proposedRent) || 0
              const pct = curr ? Math.round(((prop - curr) / curr) * 100) : 0
              
              const shareText = lang === 'es'
                ? `¡Mi arrendador en ${city} intentó subir mi alquiler un ${pct}%! Pero en Nueva Jersey los límites de aumento están regulados por ley municipal. Verifiqué mis derechos gratis en 1 minuto con Derecho a Permanecer NJ. Revisa tu aumento aquí: https://righttostaynj.org #NJRenters #DerechoAPermanecer`
                : `My landlord in ${city} tried to raise my rent by ${pct}%! But municipal rent caps are strictly enforced in New Jersey. Check your rights for free in 1 minute using Right to Stay NJ: https://righttostaynj.org #NJRenters #RightToStayNJ`
                
              const handleCopy = () => {
                navigator.clipboard.writeText(shareText)
                alert(lang === 'es' ? '¡Texto de publicación copiado!' : 'Share text copied to clipboard!')
              }
              
              const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
              const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://righttostaynj.org')}`
              
              return (
                <div className="space-y-2">
                  <textarea
                    readOnly
                    value={shareText}
                    className="w-full p-2 border border-emerald-200 bg-white rounded text-[11px] text-emerald-950 font-mono h-18 resize-none focus:outline-none"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded text-[10px] active:scale-95 transition cursor-pointer flex items-center gap-1"
                    >
                      <CopyIcon className="w-3.5 h-3.5 text-white" />
                      <span>{lang === 'es' ? 'Copiar Texto' : 'Copy Text'}</span>
                    </button>
                    <a
                      href={twitterUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded text-[10px] active:scale-95 transition flex items-center"
                    >
                      <span>{lang === 'es' ? 'Compartir en X' : 'Share on X'}</span>
                    </a>
                    <a
                      href={facebookUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded text-[10px] active:scale-95 transition flex items-center"
                    >
                      <span>{lang === 'es' ? 'Compartir en FB' : 'Share on FB'}</span>
                    </a>
                  </div>
                </div>
              )
            })()}
          </div>
        </>
      )}
    </div>
  )
}

function SolutionHub() {
  const { t } = useTranslation()
  
  const solutions = [
    {
      title: t('solution_q1_title'),
      desc: t('solution_q1_desc'),
      link: '/know-your-rights',
      icon: <WarningIcon className="w-5.5 h-5.5 text-red-600" />
    },
    {
      title: t('solution_q2_title'),
      desc: t('solution_q2_desc'),
      link: '/court-prep',
      icon: <ScalesIcon className="w-5.5 h-5.5 text-margin" />
    },
    {
      title: t('solution_q3_title'),
      desc: t('solution_q3_desc'),
      link: '/understand-your-notice',
      icon: <DocumentIcon className="w-5.5 h-5.5 text-yellow-600" />
    },
    {
      title: t('solution_q4_title'),
      desc: t('solution_q4_desc'),
      link: '/understand-your-notice',
      icon: <WarningIcon className="w-5.5 h-5.5 text-red-700" />
    }
  ]

  return (
    <div className="solution-hub-container mt-10 bg-rule/5 border border-rule rounded-xl p-6 shadow-sm">
      <h2 className="text-md font-bold text-ink mb-1 flex items-center gap-1.5">
        <ShieldIcon className="w-5.5 h-5.5 text-margin" />
        {t('solution_hub_title')}
      </h2>
      <p className="text-xs text-margin mb-6">{t('solution_hub_subtitle')}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {solutions.map((s, idx) => (
          <Link
            key={idx}
            to={s.link}
            className="solution-hub-card flex items-start gap-4 p-4 border border-rule rounded-lg bg-paper hover:border-ink hover:shadow-2xs transition active:scale-98"
          >
            <div className="shrink-0 p-2 bg-rule/10 rounded-md">
              {s.icon}
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink leading-tight">{s.title}</h3>
              <p className="text-xs text-margin/80 mt-1.5 leading-normal">{s.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function TriageWizard() {
  const { t, lang } = useTranslation()
  const [step, setStep] = useState(0) // 0: start, 1: Q1, 2: Q2, 3: Result
  const [q1, setQ1] = useState<string | null>(null)
  const [q2, setQ2] = useState<string | null>(null)

  function reset() {
    setStep(0)
    setQ1(null)
    setQ2(null)
  }

  let resultText = ''
  let resultLink = '/'

  if (q1 === 'threat') {
    resultText = t('triage_r1')
    resultLink = '/know-your-rights'
  } else if (q1 === 'yes_paper' && q2 === 'yes_date') {
    resultText = t('triage_r2')
    resultLink = '/court-prep'
  } else if (q1 === 'yes_paper' && q2 === 'warning') {
    resultText = t('triage_r3')
    resultLink = '/understand-your-notice'
  } else if (q1 === 'explore') {
    resultText = t('triage_r4')
    resultLink = '/understand-your-notice'
  }

  return (
    <div className="triage-card border-2 border-ink rounded-lg p-6 bg-paper/50 mt-6 shadow-sm animate-fade-in">
      {step === 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-ink">
            <ShieldIcon className="w-5.5 h-5.5 text-margin" />
            {t('triage_title')}
          </h2>
          <p className="text-sm leading-relaxed text-margin max-w-lg">
            {t('triage_subtitle')}
          </p>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="primary-cta mt-4 w-full sm:w-auto cursor-pointer flex items-center justify-center gap-2 active:scale-97 transition"
          >
            <span>{t('triage_start_btn')}</span>
            <DirectionsIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <span className="text-xs font-bold text-stamp uppercase tracking-wider">
            {lang === 'es' ? 'Pregunta 1 de 2' : 'Question 1 of 2'}
          </span>
          <h3 className="text-md font-bold mt-1 text-ink">{t('triage_q1')}</h3>
          <div className="flex flex-col gap-2.5 mt-4">
            <button
              type="button"
              onClick={() => { setQ1('yes_paper'); setStep(2) }}
              className="action-btn text-left justify-between py-3.5 px-4 font-semibold hover:bg-ink hover:text-paper active:scale-97 transition flex items-center"
            >
              <span className="flex items-center gap-2">
                <DocumentIcon className="w-5 h-5" />
                {t('triage_q1_a1')}
              </span>
              <DirectionsIcon className="w-4 h-4 shrink-0" />
            </button>
            <button
              type="button"
              onClick={() => { setQ1('threat'); setStep(3) }}
              className="action-btn text-left justify-between py-3.5 px-4 font-semibold hover:bg-ink hover:text-paper active:scale-97 transition flex items-center"
            >
              <span className="flex items-center gap-2 text-red-700 hover:text-paper">
                <WarningIcon className="w-5 h-5 shrink-0" />
                {t('triage_q1_a2')}
              </span>
              <DirectionsIcon className="w-4 h-4 shrink-0" />
            </button>
            <button
              type="button"
              onClick={() => { setQ1('explore'); setStep(3) }}
              className="action-btn text-left justify-between py-3.5 px-4 font-semibold hover:bg-ink hover:text-paper active:scale-97 transition flex items-center"
            >
              <span className="flex items-center gap-2">
                <ScalesIcon className="w-5 h-5" />
                {t('triage_q1_a3')}
              </span>
              <DirectionsIcon className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 animate-fade-in">
          <span className="text-xs font-bold text-stamp uppercase tracking-wider">
            {lang === 'es' ? 'Pregunta 2 de 2' : 'Question 2 of 2'}
          </span>
          <h3 className="text-md font-bold mt-1 text-ink">{t('triage_q2')}</h3>
          <div className="flex flex-col gap-2.5 mt-4">
            <button
              type="button"
              onClick={() => { setQ2('yes_date'); setStep(3) }}
              className="action-btn text-left justify-between py-3.5 px-4 font-semibold hover:bg-ink hover:text-paper active:scale-97 transition flex items-center"
            >
              <span className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                {t('triage_q2_a1')}
              </span>
              <DirectionsIcon className="w-4 h-4 shrink-0" />
            </button>
            <button
              type="button"
              onClick={() => { setQ2('warning'); setStep(3) }}
              className="action-btn text-left justify-between py-3.5 px-4 font-semibold hover:bg-ink hover:text-paper active:scale-97 transition flex items-center"
            >
              <span className="flex items-center gap-2">
                <DocumentIcon className="w-5 h-5" />
                {t('triage_q2_a2')}
              </span>
              <DirectionsIcon className="w-4 h-4 shrink-0" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="action-btn text-xs py-2 px-4 rounded-md mt-4 cursor-pointer active:scale-95 transition flex items-center gap-1.5"
          >
            <BackIcon className="w-3.5 h-3.5" />
            {t('btn_back')}
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 animate-fade-in">
          <span className="text-xs font-bold text-green-700 uppercase tracking-wider flex items-center gap-1">
            <CheckIcon className="w-4 h-4" />
            {t('triage_recommendation')}
          </span>
          <p className="text-sm font-semibold leading-relaxed mt-2 p-4 bg-ink text-paper rounded flex items-start gap-2.5">
            <WarningIcon className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
            <span>{resultText}</span>
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              to={resultLink}
              className="primary-cta mt-0 py-2.5 px-5 text-sm font-semibold rounded cursor-pointer active:scale-97 transition flex items-center gap-1"
            >
              <span>{t('triage_go_step')}</span>
              <DirectionsIcon className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={reset}
              className="action-btn text-xs py-2 px-4 rounded-md cursor-pointer active:scale-95 transition flex items-center gap-1"
            >
              <RefreshIcon className="w-3.5 h-3.5" />
              <span>{lang === 'es' ? 'Reiniciar' : 'Start Over'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function Home() {
  const { t, lang } = useTranslation()
  const [rightTab, setRightTab] = useState<'notice' | 'ai'>('notice')
  
  const portalCards = [
    {
      title: lang === 'es' ? 'Entender Mi Aviso' : 'Understand My Notice',
      icon: <DocumentIcon className="w-5 h-5 text-amber-600" />,
      desc: lang === 'es' 
        ? 'Identifique y explique su Aviso de Desalojo, Citación o Orden de Lanzamiento en NJ.'
        : 'Identify and explain your NJ Eviction Notice, Summons, or Warrant of Removal.',
      link: '/understand-your-notice',
      color: 'hover:border-amber-400 hover:shadow-amber-50/40 bg-amber-50/5'
    },
    {
      title: lang === 'es' ? 'Crear Paquete de Defensa' : 'Draft Defense Packet',
      icon: <ScalesIcon className="w-5 h-5 text-emerald-600" />,
      desc: lang === 'es'
        ? 'Use nuestro calculador de cuentas y auditor de defensas de IA para crear sus papeles de corte.'
        : 'Use our ledger calculator and AI defense auditor to draft your Special Civil Part answer papers.',
      link: '/prepare-answer',
      color: 'hover:border-emerald-400 hover:shadow-emerald-50/40 bg-emerald-50/5'
    },
    {
      title: lang === 'es' ? 'Simular Mediación de Corte' : 'Practice Court Mediation',
      icon: <MediationIcon className="w-5 h-5 text-sky-600" />,
      desc: lang === 'es'
        ? 'Practique negociar con el abogado del propietario en nuestro simulador de IA para evitar trampas.'
        : 'Practice negotiating with the landlord\'s attorney in our AI simulator to avoid eviction traps.',
      link: '/court-prep',
      color: 'hover:border-sky-400 hover:shadow-sky-50/40 bg-sky-50/5'
    },
    {
      title: lang === 'es' ? 'Buscar Ayuda y Tribunales' : 'Find Help & Courthouses',
      icon: <CourthouseIcon className="w-5 h-5 text-purple-600" />,
      desc: lang === 'es'
        ? 'Localice las oficinas de ayuda legal gratuita de su condado y direcciones de tribunales.'
        : 'Locate your local county free Legal Services offices, courthouse addresses, and phone numbers.',
      link: '/find-help',
      color: 'hover:border-purple-400 hover:shadow-purple-50/40 bg-purple-50/5'
    }
  ]

  return (
    <>
      {/* 1. Main Hero Portal Section */}
      <section className="shell py-16 md:py-24 text-center max-w-4xl mx-auto space-y-8">
        <div className="space-y-4">
          <p className="eyebrow uppercase tracking-widest text-xs font-bold text-margin/90">
            {lang === 'es' ? 'Información y herramientas de derechos de inquilinos en NJ' : 'NJ Tenant Rights Portal & Tools'}
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-ink leading-tight">
            {lang === 'es' ? 'Centro de Defensa de Inquilinos de Nueva Jersey' : 'New Jersey Eviction Defense & Tenant Rights'}
          </h1>
          <p className="text-lg text-margin/80 max-w-2xl mx-auto leading-relaxed">
            {lang === 'es'
              ? 'Herramientas gratuitas y privadas para ayudarlo a proteger su hogar. Seleccione lo que necesita a continuación para comenzar.'
              : 'Free, private tools to help you defend your home against eviction. Select what you need below to start immediately.'}
          </p>
        </div>

        {/* 4 Large Clean Portal Cards */}
        <div className="grid gap-6 sm:grid-cols-2 mt-10">
          {portalCards.map((c, i) => (
            <Link
              key={i}
              to={c.link}
              className={`flex flex-col justify-between text-left p-6 border-2 border-rule rounded-2xl shadow-3xs hover:shadow-md hover:scale-[1.01] transition-all duration-200 group cursor-pointer ${c.color}`}
            >
              <div className="space-y-2">
                <h3 className="text-md font-bold text-ink flex items-center justify-between">
                  <span className="flex items-center gap-2.5">
                    {c.icon}
                    <span>{c.title}</span>
                  </span>
                  <DirectionsIcon className="w-4 h-4 text-margin transition group-hover:translate-x-1" />
                </h3>
                <p className="text-xs leading-relaxed text-margin/80 font-medium">
                  {c.desc}
                </p>
              </div>
              <div className="mt-4 text-[11px] font-bold text-ink underline group-hover:text-margin">
                {lang === 'es' ? 'Abrir Herramienta →' : 'Launch Tool →'}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 2. Calming Rights Full-Width Section */}
      <section className="bg-green-50 border-y border-green-150 py-12">
        <div className="shell max-w-4xl mx-auto">
          <h2 className="text-lg font-bold text-ink mb-6 flex items-center gap-2 justify-center">
            <ShieldIcon className="w-5.5 h-5.5 text-emerald-800" />
            <span>{lang === 'es' ? 'No entre en pánico: Conozca sus derechos inmediatos' : 'Do Not Panic: Your Immediate Rights'}</span>
          </h2>
          <div className="grid gap-6 md:grid-cols-3 text-xs leading-relaxed font-medium text-ink/90">
            <div className="bg-white border border-green-200/65 rounded-xl p-5 shadow-3xs space-y-2">
              <div className="p-1.5 bg-green-50 rounded-lg w-fit text-emerald-700">
                <ShieldIcon className="w-5 h-5" />
              </div>
              <strong className="block text-ink">{lang === 'es' ? 'Solo oficiales autorizados:' : 'Only Court Officers:'}</strong>
              <p>
                {lang === 'es'
                  ? 'Un propietario NO puede cambiar sus cerraduras o cortar servicios sin orden judicial. Hacerlo es un delito de cierre ilegal bajo N.J.S.A. 2A:39-1.'
                  : 'A landlord CANNOT change locks, shut off utilities, or remove belongings without a court order. Doing so is illegal under N.J.S.A. 2A:39-1.'}
              </p>
            </div>
            <div className="bg-white border border-green-200/65 rounded-xl p-5 shadow-3xs space-y-2">
              <div className="p-1.5 bg-green-50 rounded-lg w-fit text-emerald-700">
                <PhoneIcon className="w-5 h-5" />
              </div>
              <strong className="block text-ink">{lang === 'es' ? 'Asistencia legal gratuita:' : 'Free Legal Services:'}</strong>
              <p>
                {lang === 'es'
                  ? 'Inquilinos que califiquen por ingresos pueden recibir representación gratuita llamando a LSNJLAW al '
                  : 'Income-eligible tenants can receive free representation by calling LSNJLAW at '}
                <a href="tel:18885765529" className="font-bold underline text-margin">1-888-576-5529</a>.
              </p>
            </div>
            <div className="bg-white border border-green-200/65 rounded-xl p-5 shadow-3xs space-y-2">
              <div className="p-1.5 bg-green-50 rounded-lg w-fit text-emerald-700">
                <ShieldIcon className="w-5 h-5" />
              </div>
              <strong className="block text-ink">{lang === 'es' ? 'Privacidad garantizada:' : '100% Confidential:'}</strong>
              <p>
                {lang === 'es'
                  ? 'Todas las búsquedas, calculadoras y chats se procesan localmente. Nunca compartimos sus datos con propietarios.'
                  : 'All search history, ledgers, and chat details remain local. We never share any information with landlords or agencies.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Tools Split View Section (Chat & Mockups) */}
      <section className="shell py-16 grid gap-12 md:grid-cols-[1fr_1fr] border-b border-rule">
        <div className="space-y-4">
          <span className="eyebrow">{lang === 'es' ? 'Consulta Instantánea con IA' : 'Instant AI Q&A'}</span>
          <h2 className="text-lg font-bold text-ink">{lang === 'es' ? '¿Tiene preguntas sobre su aviso?' : 'Got Questions About Your Notice?'}</h2>
          <p className="text-xs text-margin/80 leading-relaxed max-w-md">
            {lang === 'es' 
              ? 'Pregunte a nuestro asistente de IA sobre plazos específicos, defensas legales o los siguientes pasos.' 
              : 'Ask our AI assistant about specific timelines, legal defenses, or next steps.'}
          </p>
          <div className="shadow-xs rounded-xl overflow-hidden mt-6 bg-paper">
            <AiChatBox />
          </div>
        </div>

        <div className="space-y-4 self-start">
          <span className="eyebrow">{lang === 'es' ? 'Ejemplo de Aviso' : 'Notice Sample'}</span>
          <h2 className="text-lg font-bold text-ink">{lang === 'es' ? 'Anotaciones de Citación' : 'Eviction Document Annotations'}</h2>
          <p className="text-xs text-margin/80 leading-relaxed max-w-md">
            {lang === 'es'
              ? 'Vea cómo se estructuran las notificaciones legales oficiales en Nueva Jersey y qué significan sus cláusulas.'
              : 'See how official NJ court eviction notices are structured and what key legal clauses actually mean.'}
          </p>
          <div className="notice-sheet shadow-xs rounded-lg w-full bg-paper p-5 mt-6" aria-label="Example eviction notice">
            <div className="flex justify-between gap-4 border-b border-rule pb-4 font-notice text-xs">
              <span>SUPERIOR COURT OF NEW JERSEY<br/>SPECIAL CIVIL PART</span>
              <span>Case no. LT-000000-26</span>
            </div>
            <p className="mt-7 text-center font-notice text-xl">NOTICE TO QUIT</p>
            <div className="mt-8 flex flex-col gap-7">
              <Annotation legalText="YOU ARE HEREBY REQUIRED TO QUIT AND SURRENDER" plainText={lang === 'es' ? 'Esto dice que el arrendador quiere terminar el contrato. No es una orden de desalojo inmediata.' : 'This says the landlord wants the tenancy to end. It is not a same-day lockout order.'} />
              <Annotation legalText="COMPLAINT FOR POSSESSION" plainText={lang === 'es' ? 'Una queja judicial inicia un caso. No es la decisión final del juez.' : 'A complaint starts a court case. It is not the judge’s decision.'} />
              <Annotation legalText="JUDGMENT FOR POSSESSION HAS BEEN ENTERED" plainText={lang === 'es' ? 'Esto no significa que deba irse de su casa hoy mismo.' : 'This is not the same as being removed from your home today.'} />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Triage Wizard Section */}
      <section className="shell py-16 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <span className="eyebrow">{lang === 'es' ? 'Asistente de Triage' : 'Triage Assistant'}</span>
          <h2 className="text-lg font-bold text-ink">{lang === 'es' ? 'Encuentre su Solución Paso a Paso' : 'Find Your Solution Step-by-Step'}</h2>
        </div>
        <TriageWizard />
      </section>
    </>
  )
}

export function UnderstandNotice() {
  const { t, lang } = useTranslation()
  const [selected, setSelected] = useState(0)
  const notice = noticeTypes[selected]

  const urgencyColors = {
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
  }

  const urgencyLabels = {
    info: t('timeline_urgency_low'),
    warning: t('timeline_urgency_medium'),
    danger: t('timeline_urgency_high'),
  }

  return (
    <section className="shell page-section">
      <PageIntro eyebrow={t('notice_intro_eyebrow')} title={t('notice_intro_title')}>
        <p>{t('notice_intro_desc')}</p>
      </PageIntro>

      {/* Eviction Timeline Component */}
      <div className="timeline-container mt-12 mb-8 bg-paper border border-rule rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-6 text-center text-ink">{t('timeline_title')}</h2>
        
        <div className="relative flex justify-between items-center max-w-3xl mx-auto px-4 py-4">
          <div className="absolute left-6 right-6 h-0.5 bg-rule z-0" style={{ top: '24px' }} />
          <div 
            className="absolute left-6 h-0.5 bg-ink transition-all duration-300 z-0" 
            style={{ 
              top: '24px', 
              width: `${(selected / (noticeTypes.length - 1)) * 88}%` 
            }} 
          />

          {/* Timeline Nodes */}
          {noticeTypes.map((item, i) => {
            const isActive = selected === i
            const isCompleted = i < selected
            return (
              <button
                key={item.name}
                onClick={() => {
                  setSelected(i)
                  recordEvent({ eventType: 'notice_viewed', outcome: `guide_${i + 1}` })
                }}
                className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
                aria-pressed={isActive}
              >
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition duration-200 font-semibold ${
                    isActive 
                      ? 'bg-ink border-ink text-paper scale-110 shadow-md' 
                      : isCompleted 
                        ? 'bg-paper border-ink text-ink' 
                        : 'bg-paper border-rule text-margin group-hover:border-ink/50'
                  }`}
                >
                  {i + 1}
                </div>
                <span className={`absolute top-12 text-center text-xs font-semibold whitespace-nowrap hidden md:block transition ${
                  isActive ? 'text-ink' : 'text-margin group-hover:text-ink'
                }`}>
                  {t(item.translationKeys.name)}
                </span>
              </button>
            )
          })}
        </div>
        <div className="h-6 md:h-10" />
      </div>

      <div className="disclaimer mt-6 flex items-start gap-2 bg-rule/10 p-4 rounded-lg">
        <WarningIcon className="w-5 h-5 text-margin shrink-0 mt-0.5" />
        <div className="text-sm">
          <strong>{t('disclaimer_title')}</strong> {t('notice_disclaimer')}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[20rem_1fr]">
        
        {/* Notice Selector Sidebar - Document Mockup Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1" aria-label={t('notice_choices_label')}>
          {noticeTypes.map((item, i) => {
            const isSelected = selected === i
            let mockHeader = ''
            let mockSub = ''
            let stampClass = ''

            if (item.name === 'Notice to Cease') {
              mockHeader = 'NOTICE TO CEASE'
              mockSub = 'WARNING TO TENANT'
              stampClass = 'stamp-cease border-blue-400 text-blue-600 bg-blue-50/20'
            } else if (item.name === 'Notice to Quit') {
              mockHeader = 'NOTICE TO QUIT'
              mockSub = 'DEMAND FOR POSSESSION'
              stampClass = 'stamp-quit border-amber-400 text-amber-700 bg-amber-50/20'
            } else if (item.name === 'Complaint & Summons') {
              mockHeader = 'SUMMONS & COMPLAINT'
              mockSub = 'SUPERIOR COURT OF NJ'
              stampClass = 'stamp-summons border-red-400 text-red-700 bg-red-50/20'
            } else if (item.name === 'Judgment for Possession') {
              mockHeader = 'ORDER FOR JUDGMENT'
              mockSub = 'SPECIAL CIVIL PART ORDER'
              stampClass = 'stamp-judgment border-red-600 text-red-800 bg-red-50/30'
            } else if (item.name === 'Warrant for Removal') {
              mockHeader = 'WARRANT FOR REMOVAL'
              mockSub = 'WARNING: IMMEDIATE LOCKOUT'
              stampClass = 'stamp-warrant border-red-800 text-red-900 bg-red-100/40'
            }

            return (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  setSelected(i)
                  recordEvent({ eventType: 'notice_viewed', outcome: `guide_${i + 1}` })
                }}
                aria-pressed={isSelected}
                className={`document-mockup-card relative overflow-hidden text-left border rounded-lg p-5 bg-paper cursor-pointer transition shadow-sm active:scale-97 ${
                  isSelected ? 'border-ink ring-2 ring-ink shadow-md' : 'border-rule hover:border-ink/50'
                }`}
              >
                <div className="flex justify-between items-center text-3xs font-mono text-margin/80 uppercase border-b border-rule/50 pb-2 mb-3">
                  <span>NJ COURT FORM</span>
                  <span className="font-bold">STAGE {item.timelineStep} OF 5</span>
                </div>
                <div className="mockup-title font-notice font-bold text-center py-2 text-sm tracking-wide leading-tight text-ink">
                  {mockHeader}
                </div>
                <div className="mockup-subtitle text-4xs text-center text-margin/70 font-mono tracking-wider mb-2">
                  {mockSub}
                </div>
                <div className={`mockup-stamp absolute right-3 bottom-3 border border-dashed rounded px-1.5 py-0.5 text-4xs font-mono font-extrabold uppercase transform rotate-6 ${stampClass}`}>
                  {item.urgency}
                </div>
              </button>
            )
          })}
        </div>

        <article className="border-t border-rule pt-8 lg:border-t-0 lg:pt-0">
          <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-ink">{t(notice.translationKeys.name)}</h2>
            <div className="flex gap-2 text-xs">
              <span className={`px-2.5 py-1 rounded border font-semibold ${urgencyColors[notice.urgency]}`}>
                {t('timeline_urgency')}: {urgencyLabels[notice.urgency]}
              </span>
              <span className="px-2.5 py-1 rounded border border-rule bg-rule/20 font-semibold text-ink">
                ⏳ {t('timeline_timeframe')}: {t(notice.translationKeys.timeframe)}
              </span>
            </div>
          </div>

          <p className="eyebrow">{t('notice_what_means')}</p>
          
          <Annotation 
            key={notice.name} 
            legalText={t(notice.translationKeys.legalText)} 
            plainText={t(notice.translationKeys.plainText)} 
          />

          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            <div>
              <h3>{t('notice_not_mean')}</h3>
              <p className="leading-7 text-sm text-margin/90">
                {selected === 1 ? (
                  lang === 'es' ? (
                    <>Por lo general, no significa que deba irse hoy. El arrendador no puede realizar un desalojo sin un caso en la corte y recibir una {<GlossaryTerm termKey="warrant_of_removal">Orden de Lanzamiento</GlossaryTerm>}.</>
                  ) : (
                    <>It usually does not mean you must leave your home today. A landlord cannot execute an eviction without a court case and obtaining a {<GlossaryTerm termKey="warrant_of_removal">Warrant of Removal</GlossaryTerm>}.</>
                  )
                ) : t(notice.translationKeys.notMean)}
              </p>
            </div>
            <div>
              <h3>{t('notice_next_step')}</h3>
              <p className="leading-7 text-sm text-margin/90">
                {selected === 2 ? (
                  lang === 'es' ? (
                    <>No ignore la fecha. Llame a ayuda legal de inmediato, reúna sus documentos y prepare su defensa en el {<GlossaryTerm termKey="mediation">proceso de mediación</GlossaryTerm>} de la corte.</>
                  ) : (
                    <>Do not ignore the hearing. Call legal aid, gather your records, and prepare your response for the court's {<GlossaryTerm termKey="mediation">mediation</GlossaryTerm>} process.</>
                  )
                ) : t(notice.translationKeys.nextStep)}
              </p>
            </div>
          </div>
        </article>
      </div>

      {/* Upgraded Rent Increase Legality Check Panel */}
      <div className="mt-16 border-t border-rule pt-12">
        <div className="bg-paper border border-rule rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-ink mb-2 flex items-center gap-2">
            📈 {t('renthike_title')}
          </h2>
          <p className="text-sm text-margin mb-6">{t('renthike_desc')}</p>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="p-4 bg-rule/10 rounded-lg">
              <span className="text-xs font-bold text-stamp uppercase tracking-wider block mb-2">1. Notice Rules</span>
              <p className="text-xs leading-relaxed text-ink">{t('renthike_rule_1')}</p>
            </div>
            <div className="p-4 bg-rule/10 rounded-lg">
              <span className="text-xs font-bold text-stamp uppercase tracking-wider block mb-2">2. Unconscionable Limits</span>
              <p className="text-xs leading-relaxed text-ink">{t('renthike_rule_2')}</p>
            </div>
            <div className="p-4 bg-rule/10 rounded-lg">
              <span className="text-xs font-bold text-stamp uppercase tracking-wider block mb-2">3. Non-Payment Defense</span>
              <p className="text-xs leading-relaxed text-ink">{t('renthike_rule_3')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive AI Rent Hike auditor widget */}
      <div className="mt-8">
        <AiRentAuditor />
      </div>

      {/* Ask AI Assistant section */}
      <div className="mt-16 border-t border-rule pt-12">
        <div className="max-w-2xl mx-auto text-center mb-6">
          <span className="eyebrow">{lang === 'es' ? 'Consulta Instantánea con IA' : 'Instant AI Q&A'}</span>
          <h2 className="text-md font-bold text-ink">{lang === 'es' ? '¿Tiene preguntas sobre su aviso?' : 'Got Questions About Your Notice?'}</h2>
          <p className="text-xs text-margin/80 mt-1">
            {lang === 'es' 
              ? 'Pregunte a nuestro asistente de IA sobre plazos específicos, defensas legales o los siguientes pasos.' 
              : 'Ask our AI assistant about specific timelines, legal defenses, or next steps.'}
          </p>
        </div>
        <div className="max-w-2xl mx-auto shadow-xs">
          <AiChatBox />
        </div>
      </div>

      <div className="mt-8">
        <PrimaryLink to="/find-help">
          <span className="flex items-center gap-1.5">
            <PhoneIcon className="w-5 h-5" />
            {t('notice_talk_legal_aid')}
          </span>
        </PrimaryLink>
      </div>
    </section>
  )
}

const countyResources: Record<string, { agency: string; phone: string; address: string; rentAssistance: string }> = {
  Atlantic: {
    agency: 'Atlantic County Social Services',
    phone: '609-348-3001',
    address: '1333 Atlantic Ave, Atlantic City, NJ',
    rentAssistance: 'Atlantic County ERAP - (609) 345-6700'
  },
  Bergen: {
    agency: 'Bergen County Board of Social Services',
    phone: '201-368-4200',
    address: '218 Route 17 North, Rochelle Park, NJ',
    rentAssistance: 'Bergen County Rental Assistance - (201) 336-7400'
  },
  Burlington: {
    agency: 'Burlington County Board of Social Services',
    phone: '609-261-1000',
    address: '795 Woodlane Rd, Mount Holly, NJ',
    rentAssistance: 'Burlington County Community Action - (609) 386-5800'
  },
  Camden: {
    agency: 'Camden County Board of Social Services',
    phone: '856-225-8800',
    address: '600 Market St, Camden, NJ',
    rentAssistance: 'Camden County OEO Assistance - (856) 964-6887'
  },
  CapeMay: {
    agency: 'Cape May County Social Services',
    phone: '609-886-6200',
    address: '4005 Route 9 South, Rio Grande, NJ',
    rentAssistance: 'Cape May County Housing Aid - (609) 465-1075'
  },
  Cumberland: {
    agency: 'Cumberland County Board of Social Services',
    phone: '856-691-4600',
    address: '275 N Delsea Dr, Vineland, NJ',
    rentAssistance: 'Cumberland Community Action - (856) 451-6330'
  },
  Essex: {
    agency: 'Essex County Division of Welfare',
    phone: '973-733-3000',
    address: '18 Bloomfield Ave, Newark, NJ',
    rentAssistance: 'Essex County Housing Advisory - (973) 621-2550'
  },
  Gloucester: {
    agency: 'Gloucester County Social Services',
    phone: '856-256-2100',
    address: '400 Hollydell Dr, Sewell, NJ',
    rentAssistance: 'Gloucester County Housing Authority - (856) 845-4959'
  },
  Hudson: {
    agency: 'Hudson County Division of Welfare',
    phone: '201-420-3000',
    address: '257 Cornelison Ave, Jersey City, NJ',
    rentAssistance: 'Hudson County Housing Resource - (201) 795-1900'
  },
  Hunterdon: {
    agency: 'Hunterdon County Social Services',
    phone: '908-788-1300',
    address: '6 Gauntt Pl, Flemington, NJ',
    rentAssistance: 'Hunterdon County Family Services - (908) 782-3909'
  },
  Mercer: {
    agency: 'Mercer County Board of Social Services',
    phone: '609-989-4320',
    address: '200 Woolverton St, Trenton, NJ',
    rentAssistance: 'Mercer County ERAP / Housing Aid - (609) 989-6650'
  },
  Middlesex: {
    agency: 'Middlesex County Board of Social Services',
    phone: '732-745-3500',
    address: '181 How Ln, New Brunswick, NJ',
    rentAssistance: 'Middlesex County Housing Helpline - (732) 745-3000'
  },
  Monmouth: {
    agency: 'Monmouth County Social Services',
    phone: '732-431-6000',
    address: '3000 Kozloski Rd, Freehold, NJ',
    rentAssistance: 'Monmouth County Community Action (CAP) - (732) 774-3100'
  },
  Morris: {
    agency: 'Morris County Office of Temporary Assistance',
    phone: '973-326-7800',
    address: '340 W Hanover Ave, Morristown, NJ',
    rentAssistance: 'Morris County Housing Alliance - (973) 299-1600'
  },
  Ocean: {
    agency: 'Ocean County Board of Social Services',
    phone: '732-349-1500',
    address: '1027 Hooper Ave, Toms River, NJ',
    rentAssistance: 'Ocean County Community Action (O.C.E.A.N.) - (732) 244-5333'
  },
  Passaic: {
    agency: 'Passaic County Board of Social Services',
    phone: '973-881-0100',
    address: '80 Hamilton St, Paterson, NJ',
    rentAssistance: 'Passaic County Community Action - (973) 470-3480'
  },
  Salem: {
    agency: 'Salem County Board of Social Services',
    phone: '856-935-7510',
    address: '147 Rambo Rd, Salem, NJ',
    rentAssistance: 'Salem County Housing Authority - (856) 935-7510'
  },
  Somerset: {
    agency: 'Somerset County Board of Social Services',
    phone: '908-526-8800',
    address: '73 E High St, Somerville, NJ',
    rentAssistance: 'Somerset County Community Action - (908) 725-5430'
  },
  Sussex: {
    agency: 'Sussex County Division of Social Services',
    phone: '973-383-3600',
    address: '18 Church St, Newton, NJ',
    rentAssistance: 'Sussex County Family Services - (973) 579-0559'
  },
  Union: {
    agency: 'Union County Division of Social Services',
    phone: '908-965-2700',
    address: '342 Westminster Ave, Elizabeth, NJ',
    rentAssistance: 'Union County Housing Authority - (908) 527-4000'
  },
  Warren: {
    agency: 'Warren County Division of Temporary Assistance',
    phone: '908-475-6301',
    address: '1 Shotwell Dr, Belvidere, NJ',
    rentAssistance: 'Warren County Housing Aid - (908) 475-6591'
  }
}

export function FindHelp() {
  const { t, lang } = useTranslation()
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const countiesList = useMemo(() => {
    return [...new Set(legalAidOffices.map(o => o.county))].sort()
  }, [])

  const offices = useMemo(() => {
    return legalAidOffices.filter(o => {
      const matchesCounty = selectedCounty ? o.county === selectedCounty : true
      const matchesQuery = query 
        ? `${o.county} ${o.organization} ${o.address}`.toLowerCase().includes(query.toLowerCase())
        : true
      return matchesCounty && matchesQuery
    })
  }, [query, selectedCounty])

  function handleCopy(phone: string, county: string) {
    navigator.clipboard.writeText(phone)
    setCopiedId(county)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <section className="shell page-section">
      <PageIntro eyebrow={t('help_intro_eyebrow')} title={t('help_intro_title')}>
        <p>{t('help_intro_desc')}</p>
      </PageIntro>

      <div className="hotline">
        <p className="eyebrow">{t('help_hotline_org')}</p>
        <h2>{t('help_hotline_title')}</h2>
        <a className="phone flex items-center justify-center md:justify-start gap-2" href="tel:18885765529">
          <PhoneIcon className="w-7 h-7 text-margin" />
          1-888-576-5529
        </a>
        <p>{t('help_hotline_schedule')}</p>
        <p>{t('help_hotline_desc')}</p>
        <a className="primary-cta flex items-center justify-center gap-1.5" href="tel:18885765529">
          <PhoneIcon className="w-5 h-5" />
          {t('help_hotline_cta')}
        </a>
      </div>

      {/* Upgraded Clickable County Badge Grid */}
      <div className="mt-16 bg-rule/10 border border-rule rounded-lg p-6 shadow-sm">
        <h2 className="text-md font-bold mb-4 flex items-center gap-1.5 text-ink">
          <MapIcon className="w-5 h-5 text-margin" />
          {t('filter_counties_label')}
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedCounty(null)}
            className={`px-3.5 py-2 rounded-md text-xs font-semibold border transition cursor-pointer active:scale-95 flex items-center gap-1 ${
              selectedCounty === null 
                ? 'bg-ink border-ink text-paper' 
                : 'bg-paper border-rule text-ink hover:border-ink/50'
            }`}
          >
            <GlobeIcon className="w-3.5 h-3.5" />
            {t('filter_all_counties')}
          </button>
          {countiesList.map(county => (
            <button
              key={county}
              type="button"
              onClick={() => setSelectedCounty(county)}
              className={`px-3.5 py-2 rounded-md text-xs font-semibold border transition cursor-pointer active:scale-95 flex items-center gap-1 ${
                selectedCounty === county 
                  ? 'bg-ink border-ink text-paper' 
                  : 'bg-paper border-rule text-ink hover:border-ink/50'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5 shrink-0" />
              {county}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-12">
        <h2>{t('help_search_title')}</h2>
        <label className="mt-6 block max-w-xl font-semibold" htmlFor="county-search">
          {t('help_search_label')}
        </label>
        <input
          id="county-search"
          className="search-input"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t('help_search_placeholder')}
        />

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {selectedCounty && countyResources[selectedCounty] && (
            <article className="office-card shadow-xs border-2 border-emerald-600 bg-emerald-50/20" key="emergency-aid">
              <div className="office-card-header">
                <span className="office-county-badge flex items-center gap-1.5 bg-emerald-700 text-white font-bold px-2 py-0.5 rounded text-[10px]">
                  📢 {lang === 'es' ? 'Ayuda de Emergencia' : 'Emergency Aid'}
                </span>
                <h3 className="text-ink font-bold">{countyResources[selectedCounty].agency}</h3>
              </div>
              <div className="office-card-body space-y-2 text-xs leading-normal">
                <address className="text-margin/90 font-medium">📍 {countyResources[selectedCounty].address}</address>
                <div className="font-semibold text-ink">
                  🏢 {lang === 'es' ? 'Asistencia de Renta:' : 'Rental Assistance:'} <span className="font-bold text-emerald-800">{countyResources[selectedCounty].rentAssistance}</span>
                </div>
              </div>
              <div className="office-card-actions mt-3">
                <a className="action-btn call-btn flex items-center gap-1 active:scale-95 bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700" href={`tel:${countyResources[selectedCounty].phone.replaceAll('-', '')}`}>
                  <PhoneIcon className="w-3.5 h-3.5 text-white" />
                  {countyResources[selectedCounty].phone}
                </a>
              </div>
            </article>
          )}

          {offices.map(o => (
            <article className="office-card shadow-xs" key={o.county}>
              <div className="office-card-header">
                <span className="office-county-badge flex items-center gap-0.5">
                  <MapIcon className="w-3 h-3" />
                  {o.county} County
                </span>
                <h3 className="text-ink">{o.organization}</h3>
              </div>
              <div className="office-card-body">
                <address className="text-margin/90">{o.address}</address>
              </div>
              <div className="office-card-actions">
                <a className="action-btn call-btn flex items-center gap-1 active:scale-95" href={`tel:${o.phone.replaceAll('-', '')}`}>
                  <PhoneIcon className="w-3.5 h-3.5" />
                  {o.phone}
                </a>
                <button 
                  type="button"
                  className="action-btn copy-btn flex items-center gap-1 active:scale-95"
                  onClick={() => handleCopy(o.phone, o.county)}
                >
                  <CopyIcon className="w-3.5 h-3.5" />
                  {copiedId === o.county ? t('btn_copied') : t('btn_copy_phone')}
                </button>
                <a
                  className="action-btn directions-btn flex items-center gap-1 active:scale-95"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.organization + ' ' + o.address)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <DirectionsIcon className="w-3.5 h-3.5" />
                  {t('btn_directions')}
                </a>
              </div>
            </article>
          ))}
          {!offices.length && (
            <p className="py-8 col-span-full text-center text-margin">{t('help_no_office')}</p>
          )}
        </div>
        <p className="mt-8 text-sm leading-6 text-margin/70">{t('help_disclaimer')}</p>
      </div>
    </section>
  )
}

export function KnowRights() {
  const { t, lang } = useTranslation()
  return (
    <section className="shell page-section">
      <PageIntro eyebrow={t('rights_intro_eyebrow')} title={t('rights_intro_title')}>
        <p>{t('rights_intro_desc')}</p>
      </PageIntro>

      <div className="mt-12 border-t border-rule">
        {rights.map((r, i) => (
          <article className="rights-entry" key={i}>
            <Annotation 
              legalText={t(r.translationKeys.legalText)} 
              plainText={t(r.translationKeys.plainText)} 
            />
            <p className="mt-5 max-w-2xl leading-7 text-sm text-ink">
              {i === 0 ? (
                lang === 'es' ? (
                  <>La mayoría de las notificaciones son pasos en un proceso. Un {<GlossaryTerm termKey="notice_to_quit">Aviso de Desalojo</GlossaryTerm>} es una advertencia, no una orden de salida inmediata.</>
                ) : (
                  <>Most notices are warnings in a process. A {<GlossaryTerm termKey="notice_to_quit">Notice to Quit</GlossaryTerm>} is an advisory warning, not an order of immediate removal.</>
                )
              ) : i === 1 ? (
                lang === 'es' ? (
                  <>El propietario no puede cambiar las cerraduras sin que un oficial de la corte ejecute una {<GlossaryTerm termKey="warrant_of_removal">Orden de Lanzamiento</GlossaryTerm>} judicial.</>
                ) : (
                  <>A landlord cannot change your locks without a Special Civil Part officer executing a court-approved {<GlossaryTerm termKey="warrant_of_removal">Warrant of Removal</GlossaryTerm>}.</>
                )
              ) : t(r.translationKeys.detail)}
            </p>
          </article>
        ))}
      </div>
      
      {/* Emergency Lockout Police Script Card */}
      <article className="mt-12 bg-red-50/15 border-2 border-red-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-md font-bold text-red-950 flex items-center gap-2 mb-2">
          👮 {lang === 'es' ? 'Guión de Emergencia para la Policía (Cierre Ilegal)' : 'Emergency Lockout: Police SOS Dispatch Script'}
        </h3>
        <p className="text-xs text-margin/90 leading-relaxed mb-4">
          {lang === 'es'
            ? 'Bajo la ley de NJ (N.J.S.A. 2A:39-1), los propietarios tienen estrictamente prohibido realizar desalojos por mano propia (cambiar llaves, cortar agua/luz). Si su Arrendador hace esto, llame al 911 de inmediato. Use este guión para hablar con los oficiales:'
            : 'Under NJ Statute N.J.S.A. 2A:39-1, landlords are strictly prohibited from lockout attempts (changing locks, cutting services). If your landlord does this, call 911 immediately. Use this script to speak to officers:'}
        </p>

        <div className="space-y-3.5 text-xs">
          <div className="p-3 bg-paper border border-red-100 rounded-lg">
            <strong className="block text-red-900 font-bold uppercase tracking-wider mb-1">
              📞 {lang === 'es' ? '1. Qué decir al despachador del 911:' : '1. What to say to the 911 dispatcher:'}
            </strong>
            <p className="font-mono text-ink italic leading-relaxed">
              {lang === 'es'
                ? '"Quiero reportar un cierre patronal ilegal en curso ("self-help lockout"). Mi arrendador ha cambiado mis llaves sin orden judicial, violando el estatuto estatal N.J.S.A. 2A:39-1. Necesito que se envíe una patrulla para ordenar el reingreso."'
                : '"I am reporting an illegal self-help lockout in progress. My landlord has changed my locks and locked me out without a court warrant, violating NJ Statute N.J.S.A. 2A:39-1. I need an officer dispatched to require re-entry."'}
            </p>
          </div>

          <div className="p-3 bg-paper border border-red-100 rounded-lg">
            <strong className="block text-red-900 font-bold uppercase tracking-wider mb-1">
              👮 {lang === 'es' ? '2. Qué decir al oficial de policía que responda:' : '2. What to say to the responding officer:'}
            </strong>
            <p className="font-mono text-ink italic leading-relaxed">
              {lang === 'es'
                ? '"Oficial, esta es una exclusión ilegal. Bajo N.J.S.A. 2A:39-1, es un delito menor ("disorderly persons offense") que un arrendador me excluya de mi hogar. Aquí tengo mi contrato de arrendamiento/recibo que prueba que resido aquí. Por favor, ordene al propietario que me permita el reingreso inmediato o emita una citación por desalojo ilegal."'
                : '"Officer, this is an illegal lockout. Under N.J.S.A. 2A:39-1, it is a disorderly persons offense for a landlord to execute a self-help lockout. I have my lease/receipt showing my tenancy. Please instruct the landlord to let me back in immediately or issue a summons for lockout."'}
            </p>
          </div>
        </div>
      </article>

      <div className="mt-8 flex gap-3 print-hide">
        <PrimaryLink to="/find-help">
          <span className="flex items-center gap-1.5">
            <PhoneIcon className="w-5 h-5" />
            {t('rights_intro_title')}
          </span>
        </PrimaryLink>
      </div>
      
      <p className="review-note flex items-start gap-1.5 mt-8 bg-rule/10 p-3.5 rounded-lg text-xs leading-relaxed text-margin print-hide">
        <WarningIcon className="w-4 h-4 shrink-0 text-margin/80 mt-0.5" />
        <span>{t('rights_review_note')}</span>
      </p>
    </section>
  )
}

export function CourtPrep() {
  const { t, lang } = useTranslation()

  const [trialDate, setTrialDate] = useState('')
  const [trialTime, setTrialTime] = useState('09:00')
  const [trialRoom, setTrialRoom] = useState('')
  const [trialCounty, setTrialCounty] = useState('')

  const [logEntries, setLogEntries] = useState<{ id: string; date: string; dayTemp: string; nightTemp: string; notes: string }[]>(() => {
    try {
      const saved = localStorage.getItem('rts-habitability-log')
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      return []
    }
  })
  
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0])
  const [dayTemp, setDayTemp] = useState('')
  const [nightTemp, setNightTemp] = useState('')
  const [logNotes, setLogNotes] = useState('')

  function addLogEntry(e: React.FormEvent) {
    e.preventDefault()
    if (!logDate || !dayTemp) return
    const newEntry = {
      id: Date.now().toString(),
      date: logDate,
      dayTemp,
      nightTemp,
      notes: logNotes
    }
    const updated = [newEntry, ...logEntries].sort((a, b) => b.date.localeCompare(a.date))
    setLogEntries(updated)
    localStorage.setItem('rts-habitability-log', JSON.stringify(updated))
    setDayTemp('')
    setNightTemp('')
    setLogNotes('')
  }

  function deleteLogEntry(id: string) {
    const updated = logEntries.filter(entry => entry.id !== id)
    setLogEntries(updated)
    localStorage.setItem('rts-habitability-log', JSON.stringify(updated))
  }
  
  const checklist = [
    t('court_check_1') !== 'court_check_1' ? t('court_check_1') : 'The notice, complaint, summons, and every page you received',
    t('court_check_2') !== 'court_check_2' ? t('court_check_2') : 'A photo ID',
    t('court_check_3') !== 'court_check_3' ? t('court_check_3') : 'Your lease and any written agreements',
    t('court_check_4') !== 'court_check_4' ? t('court_check_4') : 'Proof of income',
    t('court_check_5') !== 'court_check_5' ? t('court_check_5') : 'Proof of rent payments, especially if you dispute the amount claimed',
    t('court_check_6') !== 'court_check_6' ? t('court_check_6') : 'Messages, letters, photos, or repair requests related to the case',
    t('court_check_7') !== 'court_check_7' ? t('court_check_7') : 'A short timeline of important events and questions you want to ask',
  ]

  const [checked, setChecked] = useState<boolean[]>(checklist.map(() => false))
  const total = checked.filter(Boolean).length

  const getDaysLeft = () => {
    if (!trialDate) return null
    const diff = new Date(trialDate + 'T00:00:00').getTime() - new Date().setHours(0,0,0,0)
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }
  const daysLeft = getDaysLeft()

  function downloadIcs() {
    if (!trialDate) return
    const dateParts = trialDate.split('-') // YYYY-MM-DD
    const timeParts = (trialTime || '09:00').split(':') // HH:MM
    
    const startYear = dateParts[0]
    const startMonth = dateParts[1]
    const startDay = dateParts[2]
    const startHour = timeParts[0]
    const startMin = timeParts[1]

    // Format for ICS: YYYYMMDDTHHMMSS
    const dtStart = `${startYear}${startMonth}${startDay}T${startHour}${startMin}00`
    // Assume 2 hours duration
    const endHourVal = parseInt(startHour) + 2
    const endHour = endHourVal < 10 ? `0${endHourVal}` : `${endHourVal}`
    const dtEnd = `${startYear}${startMonth}${startDay}T${endHour}${startMin}00`

    const countyOffice = trialCounty ? `${trialCounty} County Special Civil Part` : 'NJ Special Civil Part Courthouse'
    const roomDetails = trialRoom ? `, Room ${trialRoom}` : ''
    const location = `${countyOffice}${roomDetails}`

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//RightToStayNJ//CourtHearing//EN',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@righttostaynj.org`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      'SUMMARY:NJ Landlord-Tenant Eviction Hearing',
      `DESCRIPTION:Bring all printed lease contracts\\, rent receipts\\, habitability photos\\, and defense packets. Call LSNJLAW free legal aid at 1-888-576-5529 if you need assistance.`,
      `LOCATION:${location}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n')

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `court_hearing_${trialDate}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    recordEvent({ eventType: 'checklist_completed', outcome: `ics_${trialCounty || 'unknown'}` })
  }

  return (
    <section className="shell page-section">
      <div className="print-hide">
        <PageIntro eyebrow={t('court_intro_eyebrow')} title={t('court_intro_title')}>
          <p>{t('court_intro_desc')}</p>
        </PageIntro>
      </div>

      <div className="hidden print:block border-b-2 border-ink pb-4 mb-6">
        <h1 className="text-xl font-bold uppercase tracking-wider">{t('court_intro_title')}</h1>
        <p className="text-xs text-margin font-semibold mt-1">Right to Stay NJ — {t('court_intro_eyebrow')}</p>
      </div>

      <div className="print-hide flex flex-wrap gap-3 items-center justify-between mt-6 bg-paper border border-rule rounded-xl p-5 shadow-2xs">
        <div className="max-w-md">
          <h3 className="text-sm font-bold text-ink uppercase tracking-wider mb-1">
            📅 {lang === 'es' ? 'Planifique sus Recordatorios Judiciales' : 'Schedule Court Reminders'}
          </h3>
          <p className="text-xs text-margin">
            {lang === 'es' 
              ? 'Ingrese su fecha de juicio para generar una alerta de calendario (.ics) y ver su cronograma de preparación.' 
              : 'Enter your trial date to generate a calendar alert (.ics) and view your preparation timeline.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5 items-end mt-3 sm:mt-0 w-full sm:w-auto">
          <label className="text-2xs font-bold text-ink uppercase flex flex-col gap-1 w-full sm:w-36">
            {lang === 'es' ? 'Fecha' : 'Date'}
            <input 
              type="date" 
              value={trialDate} 
              onChange={e => setTrialDate(e.target.value)} 
              className="p-1.5 border border-rule rounded bg-paper text-xs" 
            />
          </label>
          <label className="text-2xs font-bold text-ink uppercase flex flex-col gap-1 w-full sm:w-20">
            {lang === 'es' ? 'Hora' : 'Time'}
            <input 
              type="time" 
              value={trialTime} 
              onChange={e => setTrialTime(e.target.value)} 
              className="p-1.5 border border-rule rounded bg-paper text-xs" 
            />
          </label>
          <label className="text-2xs font-bold text-ink uppercase flex flex-col gap-1 w-full sm:w-20">
            {lang === 'es' ? 'Sala' : 'Room'}
            <input 
              type="text" 
              value={trialRoom} 
              onChange={e => setTrialRoom(e.target.value)} 
              placeholder="e.g. 201"
              className="p-1.5 border border-rule rounded bg-paper text-xs" 
            />
          </label>
          <label className="text-2xs font-bold text-ink uppercase flex flex-col gap-1 w-full sm:w-28">
            {lang === 'es' ? 'Condado' : 'County'}
            <select 
              value={trialCounty} 
              onChange={e => setTrialCounty(e.target.value)}
              className="p-1.5 border border-rule rounded bg-paper text-xs"
            >
              <option value="">-- Choose --</option>
              <option value="Bergen">Bergen</option>
              <option value="Burlington">Burlington</option>
              <option value="Camden">Camden</option>
              <option value="Essex">Essex</option>
              <option value="Gloucester">Gloucester</option>
              <option value="Hudson">Hudson</option>
              <option value="Mercer">Mercer</option>
              <option value="Middlesex">Middlesex</option>
              <option value="Monmouth">Monmouth</option>
              <option value="Ocean">Ocean</option>
              <option value="Passaic">Passaic</option>
              <option value="Union">Union</option>
            </select>
          </label>
          <button 
            onClick={downloadIcs}
            disabled={!trialDate}
            className="primary-cta mt-0 py-1.5 px-3 rounded font-bold text-xs bg-stamp border-stamp shrink-0 active:scale-95 transition disabled:opacity-50"
          >
            📥 {lang === 'es' ? 'Descargar Alerta' : 'Download alert'}
          </button>
        </div>
      </div>

      {/* Trial Countdown Alerts */}
      {daysLeft !== null && (
        <div className="print-hide mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-xs text-yellow-950 flex items-start gap-2.5 shadow-2xs">
          <WarningIcon className="w-5 h-5 text-yellow-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-yellow-900 mb-1">
              ⏳ {daysLeft === 0 
                ? (lang === 'es' ? '¡Su Juicio es HOY!' : 'Your Trial is TODAY!') 
                : daysLeft < 0 
                  ? (lang === 'es' ? 'La fecha ingresada ya pasó' : 'This date has already passed') 
                  : (lang === 'es' ? `Faltan ${daysLeft} días para su fecha judicial` : `${daysLeft} days remaining until your court hearing`)}
            </h4>
            <p className="leading-relaxed">
              {daysLeft < 0 ? (
                lang === 'es' 
                  ? 'Si no asistió a su audiencia, es probable que se haya dictado un Fallo por Falta de Comparecencia (Default Judgment). Llame a ayuda legal de inmediato para solicitar la anulación del fallo.'
                  : 'If you missed your hearing date, a Default Judgment was likely entered. Call legal aid immediately to ask about vacating the default judgment.'
              ) : daysLeft === 0 ? (
                lang === 'es'
                  ? 'Vaya al tribunal de inmediato. Lleve todas las pruebas impresas, regístrese en la Sala indicada y no firme ningún acuerdo sin antes asesorarse.'
                  : 'Go to the courthouse immediately. Bring your printed evidence, check in at the room, and do not sign any agreement without legal consultation.'
              ) : daysLeft <= 2 ? (
                lang === 'es'
                  ? 'La fecha se acerca. Asegúrese de imprimir sus fotos a color, las capturas de chats y los recibos de alquiler. ¡Prepare su carpeta de evidencias hoy!'
                  : 'The date is close. Ensure you have printouts of your photos, text messages, and rent receipts. Prepare your evidence folder today!'
              ) : daysLeft <= 7 ? (
                lang === 'es'
                  ? 'Es momento de practicar su caso. Complete su Resumen de Hechos en el centro de Answer y practique el simulador de mediación judicial a continuación.'
                  : 'Time to practice your response. Draft your Answer packet and practice mediation using the interactive simulator below.'
              ) : (
                lang === 'es'
                  ? 'Tiene tiempo para organizarse. Comience por reunir copias de su contrato de arrendamiento y recibos históricos para redactar sus cartas al propietario.'
                  : 'You have time to prepare. Start gathering your lease contracts and rent receipts to draft your landlord letters.'
              )}
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-6 print-hide">
        <button className="primary-cta mt-0 flex items-center justify-center gap-1.5 active:scale-97 transition" onClick={() => window.print()}>
          <PrintIcon className="w-5 h-5" />
          {t('court_print_btn')}
        </button>
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_.8fr]">
        <div>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-lg font-bold text-ink">{t('court_bring_title')}</h2>
            <span className="text-xs bg-rule/30 px-2 py-0.5 rounded font-bold text-margin">
              {total} {t('court_of')} {checklist.length} {t('court_ready_label')}
            </span>
          </div>
          <div className="mt-5 border-t border-rule">
            {checklist.map((item, i) => (
              <label className="check-row flex items-start gap-3 py-3.5 border-b border-rule cursor-pointer active:scale-99 transition" key={item}>
                <input
                  type="checkbox"
                  checked={checked[i]}
                  className="mt-1 rounded border-rule text-ink focus:ring-ink"
                  onChange={() => setChecked(c => c.map((v, j) => (j === i ? !v : v)))}
                />
                <span className="text-sm font-medium text-ink select-none">{item}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-10 print-hide">
          <div>
            <h2 className="text-lg font-bold text-ink">{t('court_happens_title')}</h2>
            <ol className="mt-5 list-decimal pl-5 leading-7 text-sm flex flex-col gap-3 text-margin/90">
              <li>{t('court_happens_1')}</li>
              <li>
                {lang === 'es' ? (
                  <>Las partes pueden intentar llegar a un acuerdo mediante {<GlossaryTerm termKey="mediation">procesos de mediación</GlossaryTerm>} obligatorios.</>
                ) : (
                  <>Parties may attempt to settle their dispute through required {<GlossaryTerm termKey="mediation">mediation</GlossaryTerm>} procedures.</>
                )}
              </li>
              <li>{t('court_happens_3')}</li>
              <li>{t('court_happens_4')}</li>
            </ol>
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink">{t('court_miss_title')}</h2>
            <p className="mt-5 leading-7 text-sm text-margin/80">{t('court_miss_desc')}</p>
            <a className="text-link mt-3 inline-flex items-center gap-1 font-bold text-sm" href="tel:18885765529">
              <PhoneIcon className="w-4 h-4" />
              LSNJLAW: 1-888-576-5529
            </a>
          </div>
        </div>
      </div>

      {/* Upgraded Interactive Evidence Packager Section */}
      <div className="mt-16 border-t border-rule pt-12 print-hide">
        <h2 className="text-2xl font-bold mb-4 text-ink">{t('evidence_title')}</h2>
        <p className="text-margin mb-8 max-w-3xl leading-relaxed text-sm">{t('evidence_desc')}</p>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="bg-paper border border-rule rounded-lg p-6 shadow-2xs hover:shadow-xs transition">
            <h3 className="text-md font-semibold mb-3 flex items-center gap-2 text-ink">
              <PhoneIcon className="w-5.5 h-5.5 text-margin" />
              {t('evidence_texts_title')}
            </h3>
            <p className="text-sm leading-6 text-margin/80">{t('evidence_texts_desc')}</p>
          </div>

          <div className="bg-paper border border-rule rounded-lg p-6 shadow-2xs hover:shadow-xs transition">
            <h3 className="text-md font-semibold mb-3 flex items-center gap-2 text-ink">
              <CameraIcon className="w-5.5 h-5.5 text-margin" />
              {t('evidence_photos_title')}
            </h3>
            <p className="text-sm leading-6 text-margin/80">{t('evidence_photos_desc')}</p>
          </div>

          <div className="bg-paper border border-rule rounded-lg p-6 shadow-2xs hover:shadow-xs transition">
            <h3 className="text-md font-semibold mb-3 flex items-center gap-2 text-ink">
              <PlusIcon className="w-5.5 h-5.5 text-margin" />
              {t('evidence_repair_title')}
            </h3>
            <p className="text-sm leading-6 text-margin/80">
              {lang === 'es' ? (
                <>Si descontó alquiler por fallas vitales, prepare los comprobantes que justifiquen su {<GlossaryTerm termKey="marini_defense">Defensa Marini</GlossaryTerm>} de reparar y deducir.</>
              ) : (
                <>If you deducted rent for vital repairs, gather evidence validating your {<GlossaryTerm termKey="marini_defense">Marini Defense</GlossaryTerm>} (repair and deduct).</>
              )}
            </p>
          </div>

          <div className="bg-paper border border-rule rounded-lg p-6 shadow-2xs hover:shadow-xs transition">
            <h3 className="text-md font-semibold mb-3 flex items-center gap-2 text-ink">
              <CalendarIcon className="w-5.5 h-5.5 text-margin" />
              {t('evidence_timeline_title')}
            </h3>
            <p className="text-sm leading-6 text-margin/80">{t('evidence_timeline_desc')}</p>
          </div>
        </div>
      </div>

      {/* Practice simulator */}
      <div className="mt-16 border-t border-rule pt-12 print-hide">
        <AiMediationSimulator />
      </div>

      {/* Mediation Settlement Red Flags Warn Area */}
      <div className="mt-16 border-t border-rule pt-12 bg-red-50/10 border border-dashed border-red-200 p-6 rounded-xl print-hide">
        <h2 className="text-xl font-bold mb-2 text-red-950 flex items-center gap-2">
          <WarningIcon className="w-6 h-6 text-red-700 shrink-0" />
          {t('mediation_warning_title')}
        </h2>
        <p className="text-sm text-margin mb-8 max-w-3xl leading-relaxed">{t('mediation_warning_desc')}</p>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="bg-paper border border-red-100 rounded-lg p-5 hover:shadow-sm transition">
            <h3 className="text-sm font-bold mb-2 text-red-900 uppercase tracking-wide">
              🚩 1. {t('mediation_flag_1_title')}
            </h3>
            <p className="text-xs leading-5 text-margin/90">{t('mediation_flag_1_desc')}</p>
          </div>

          <div className="bg-paper border border-red-100 rounded-lg p-5 hover:shadow-sm transition">
            <h3 className="text-sm font-bold mb-2 text-red-900 uppercase tracking-wide">
              🚩 2. {t('mediation_flag_2_title')}
            </h3>
            <p className="text-xs leading-5 text-margin/90">{t('mediation_flag_2_desc')}</p>
          </div>

          <div className="bg-paper border border-red-100 rounded-lg p-5 hover:shadow-sm transition">
            <h3 className="text-sm font-bold mb-2 text-red-900 uppercase tracking-wide">
              🚩 3. {t('mediation_flag_3_title')}
            </h3>
            <p className="text-xs leading-5 text-margin/90">{t('mediation_flag_3_desc')}</p>
          </div>
        </div>
      </div>

      {/* Habitability Log Widget */}
      <div className="mt-16 border-t border-rule pt-12 print-hide bg-paper border border-rule rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-2 text-ink flex items-center gap-2">
          🌡️ {lang === 'es' ? 'Bitácora de Habitabilidad y Calefacción' : 'Daily Habitability & Heat Evidence Log'}
        </h2>
        <p className="text-xs text-margin mb-6 leading-relaxed">
          {lang === 'es'
            ? 'NJ requiere que los propietarios mantengan la calefacción a un mínimo de 68°F durante el día. Utilice este diario para registrar las condiciones de su apartamento y expórtelo como prueba formal para la corte.'
            : 'NJ law requires landlords to maintain heat at a minimum of 68°F during the day. Use this log to track your apartment conditions daily, then export it as formal evidence for court.'}
        </p>

        <form onSubmit={addLogEntry} className="grid gap-3 sm:grid-cols-5 items-end mb-6">
          <label className="text-2xs font-bold text-ink uppercase flex flex-col gap-1">
            {lang === 'es' ? 'Fecha' : 'Date'}
            <input
              type="date"
              required
              value={logDate}
              onChange={e => setLogDate(e.target.value)}
              className="p-2 border border-rule rounded bg-paper text-xs"
            />
          </label>
          <label className="text-2xs font-bold text-ink uppercase flex flex-col gap-1">
            {lang === 'es' ? 'Temp. Diurna (°F)' : 'Day Temp (°F)'}
            <input
              type="number"
              required
              placeholder="e.g. 62"
              value={dayTemp}
              onChange={e => setDayTemp(e.target.value)}
              className="p-2 border border-rule rounded bg-paper text-xs"
            />
          </label>
          <label className="text-2xs font-bold text-ink uppercase flex flex-col gap-1">
            {lang === 'es' ? 'Temp. Nocturna (°F)' : 'Night Temp (°F)'}
            <input
              type="number"
              placeholder="e.g. 58"
              value={nightTemp}
              onChange={e => setNightTemp(e.target.value)}
              className="p-2 border border-rule rounded bg-paper text-xs"
            />
          </label>
          <label className="text-2xs font-bold text-ink uppercase flex flex-col gap-1 sm:col-span-2">
            {lang === 'es' ? 'Notas / Observaciones' : 'Notes / Defects'}
            <input
              type="text"
              placeholder="e.g. No heat all day, mold in bathroom"
              value={logNotes}
              onChange={e => setLogNotes(e.target.value)}
              className="p-2 border border-rule rounded bg-paper text-xs"
            />
          </label>
          <button
            type="submit"
            className="primary-cta mt-0 py-2 w-full font-bold text-xs bg-ink border-ink hover:bg-margin shrink-0 active:scale-95 transition"
          >
            ＋ {lang === 'es' ? 'Agregar Registro' : 'Add Entry'}
          </button>
        </form>

        {logEntries.length > 0 ? (
          <div className="space-y-4">
            <div className="overflow-x-auto border border-rule rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-rule/20 text-ink font-bold border-b border-rule">
                  <tr>
                    <th className="p-3">{lang === 'es' ? 'Fecha' : 'Date'}</th>
                    <th className="p-3">{lang === 'es' ? 'Temp. Día' : 'Day Temp'}</th>
                    <th className="p-3">{lang === 'es' ? 'Temp. Noche' : 'Night Temp'}</th>
                    <th className="p-3">{lang === 'es' ? 'Notas de Defectos' : 'Defect Notes'}</th>
                    <th className="p-3 print-hide">{lang === 'es' ? 'Acción' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule/50">
                  {logEntries.map((item) => (
                    <tr key={item.id} className="hover:bg-rule/5">
                      <td className="p-3 text-margin/80">{item.date}</td>
                      <td className="p-3 font-semibold text-ink">{item.dayTemp}°F</td>
                      <td className="p-3 text-ink">{item.nightTemp ? `${item.nightTemp}°F` : '-'}</td>
                      <td className="p-3 text-ink">{item.notes || '-'}</td>
                      <td className="p-3 print-hide">
                        <button
                          type="button"
                          onClick={() => deleteLogEntry(item.id)}
                          className="text-red-700 hover:text-red-900 font-bold active:scale-95 transition cursor-pointer"
                        >
                          {lang === 'es' ? 'Eliminar' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-xs text-margin/70 italic text-center py-4 bg-rule/5 rounded">
            {lang === 'es' ? 'Aún no ha agregado registros a su bitácora.' : 'No entries added to the log yet.'}
          </p>
        )}
      </div>

      {/* Print-Only Habitability Log Evidence Sheet */}
      {logEntries.length > 0 && (
        <div className="hidden print:block mt-8 border-t-2 border-ink pt-8">
          <h2 className="text-lg font-bold uppercase tracking-wider text-center">{lang === 'es' ? 'REGISTRO DE TEMPERATURAS Y HABITABILIDAD DE LA VIVIENDA' : 'APARTMENT TEMPERATURE & HABITABILITY LOG'}</h2>
          <p className="text-2xs text-center text-margin mt-1 mb-6">
            {lang === 'es'
              ? 'Presentado como prueba formal de deficiencias habitacionales en el Tribunal Civil de NJ.'
              : 'Presented as formal evidence of housing deficiencies in the NJ Special Civil Part.'}
          </p>

          <table className="w-full text-left text-xs border-collapse border border-ink">
            <thead>
              <tr className="border-b border-ink bg-gray-50">
                <th className="p-2 border-r border-ink">{lang === 'es' ? 'Fecha' : 'Date'}</th>
                <th className="p-2 border-r border-ink">{lang === 'es' ? 'Temp. Día' : 'Day Temp'}</th>
                <th className="p-2 border-r border-ink">{lang === 'es' ? 'Temp. Noche' : 'Night Temp'}</th>
                <th className="p-2">{lang === 'es' ? 'Detalles de Incumplimientos' : 'Defect / Issue Details'}</th>
              </tr>
            </thead>
            <tbody>
              {logEntries.map(item => (
                <tr key={item.id} className="border-b border-ink">
                  <td className="p-2 border-r border-ink font-mono">{item.date}</td>
                  <td className="p-2 border-r border-ink font-bold">{item.dayTemp}°F</td>
                  <td className="p-2 border-r border-ink">{item.nightTemp ? `${item.nightTemp}°F` : '-'}</td>
                  <td className="p-2">{item.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function LocalScaleIcon({ className = "w-6 h-6" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 8.25h18M3 13.5h18M6 8.25l3 5.25m-3-5.25L3 13.5m15-5.25l3 5.25m-3-5.25l-3 5.25M6 13.5a3 3 0 100 6 3 3 0 000-6zm12 0a3 3 0 100 6 3 3 0 000-6z" />
    </svg>
  )
}

function LocalSparkIcon({ className = "w-6 h-6" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
    </svg>
  )
}

function LocalWrenchIcon({ className = "w-6 h-6" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A1.875 1.875 0 1020 18.25l-5.83-5.83M11.42 15.17a3 3 0 11-4.24-4.24m4.24 4.24a3 3 0 10-4.24-4.24M5.58 9.75L4 11.33A1.875 1.875 0 111.37 8.71l1.58-1.58M12.25 2.25l-1.58 1.58a1.875 1.875 0 102.62 2.62L14.88 4.88M9.75 5.58L8.17 4.1a1.875 1.875 0 112.62-2.63L12.25 3" />
    </svg>
  )
}

function LocalFistIcon({ className = "w-6 h-6" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.746 3.746 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
    </svg>
  )
}

function LocalLockIcon({ className = "w-6 h-6" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  )
}

function LocalHeartIcon({ className = "w-6 h-6" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  )
}

function LocalCodeIcon({ className = "w-6 h-6" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
  )
}

export function About() {
  const { t, lang } = useTranslation()

  return (
    <section className="shell page-section max-w-4xl mx-auto space-y-12">
      <PageIntro eyebrow={t('about_eyebrow')} title={lang === 'es' ? 'La Historia Detrás de Derecho a Permanecer NJ' : 'The Right to Stay NJ Story'}>
        <p className="text-base text-margin/90 leading-relaxed max-w-3xl">
          {lang === 'es' 
            ? 'Una iniciativa independiente nacida para nivelar la balanza de la justicia de inquilinos en las cortes de Nueva Jersey.'
            : 'An independent initiative born to level the scales of housing justice for tenants across New Jersey.'}
        </p>
      </PageIntro>

      {/* The Story Grid */}
      <div className="grid gap-10 md:grid-cols-2 mt-8">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-ink border-b border-rule pb-2 flex items-center gap-2">
            <LocalScaleIcon className="w-5.5 h-5.5 text-emerald-800" />
            <span>{lang === 'es' ? 'El Gran Desequilibrio' : 'The Stark Imbalance'}</span>
          </h2>
          <p className="text-sm leading-relaxed text-margin/90">
            {lang === 'es'
              ? 'En los tribunales de desalojo de Nueva Jersey, la balanza está trágicamente inclinada. Más del 80% de los propietarios comparecen respaldados por abogados corporativos experimentados. En contraste, más del 90% de los inquilinos se presentan solos ("pro se"), desarmados ante laberintos de leyes estatales y plazos procesales estrictos.'
              : 'In New Jersey\'s landlord-tenant courts, the scales of justice are dangerously tilted. Over 80% of landlords walk into hearings backed by seasoned, corporate attorneys. In contrast, over 90% of tenants stand alone ("pro se"), defenseless against confusing state statutes and strict procedural deadlines.'}
          </p>
          <p className="text-sm leading-relaxed text-margin/90">
            {lang === 'es'
              ? 'No es falta de derechos; Nueva Jersey tiene algunas de las protecciones al inquilino más fuertes de la nación. Es un problema de acceso. Sin un abogado, un simple tecnicismo legal o un acuerdo de mediación engañoso se convierte en un boleto de ida al desplazamiento para miles de familias.'
              : 'The issue isn\'t a lack of legal rights—New Jersey actually has some of the strongest tenant protections in the country. The issue is access. Without counsel, a minor procedural detail or a misleading settlement agreement becomes a fast track to displacement for thousands of families.'}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-ink border-b border-rule pb-2 flex items-center gap-2">
            <LocalSparkIcon className="w-5.5 h-5.5 text-amber-700" />
            <span>{lang === 'es' ? 'La Chispa que lo Inició Todo' : 'The Spark in the Cold'}</span>
          </h2>
          <p className="text-sm leading-relaxed text-margin/90 italic bg-rule/10 p-4 rounded-lg border-l-4 border-margin">
            {lang === 'es'
              ? '"Comenzó en un pasillo frío de la corte de Newark. Una madre soltera sostenía un papel verde arrugado: una Citación de Desalojo que no lograba comprender. Tenía pruebas de que su calentador estuvo roto todo el invierno, pero no sabía cómo presentarlas ante el juez. Esa noche, decidimos construir esto."'
              : '"It started in a drafty hallway at the Newark courthouse. A single mother sat clutching a crumpled green sheet of paper—an Eviction Summons she couldn\'t read. She had folders of receipts showing her heating was broken all winter, but didn\'t know how to declare it. That night, we resolved to build a shield."'}
          </p>
          <p className="text-sm leading-relaxed text-margin/90">
            {lang === 'es'
              ? 'Derecho a Permanecer NJ nació como un traductor de código abierto. Queríamos tomar los documentos judiciales intimidantes y convertirlos en guías visuales legibles. Hoy es una plataforma completa impulsada por IA que audita defensas, simula mediaciones y redacta notificaciones legales.'
              : 'Right to Stay NJ began as a simple, open-source document translator. We wanted to take intimidating court summonses and turn them into readable, step-by-step guides. Today, it has evolved into a comprehensive suite that audits defenses, simulates mediation, and drafts legal notifications.'}
          </p>
        </div>
      </div>

      {/* Solo Developer Story Section */}
      <div className="mt-16 border-t border-rule pt-12">
        <div className="bg-emerald-50/15 border border-emerald-200 rounded-xl p-6 md:p-8 space-y-6">
          <h2 className="text-2xl font-bold text-ink flex items-center gap-2.5">
            <LocalCodeIcon className="w-6.5 h-6.5 text-emerald-800" />
            <span>{lang === 'es' ? 'La Misión de un Desarrollador Solitario' : 'The Solo Developer\'s Mission'}</span>
          </h2>
          <div className="grid gap-8 md:grid-cols-[1fr_200px]">
            <div className="space-y-4 text-sm leading-relaxed text-margin/95 font-medium">
              <p>
                {lang === 'es'
                  ? 'Este proyecto no es el producto de una gran empresa o corporación legal. Fue conceptualizado, diseñado y construido por completo por un único desarrollador apasionado por usar la tecnología para el bien público y la justicia de inquilinos en su comunidad de Nueva Jersey.'
                  : 'This platform is not the product of a large corporation, law firm, or state agency. It was conceptualized, designed, and coded entirely by a single civic-minded software developer driven by a desire to level the playing field for working-class tenants in New Jersey.'}
              </p>
              <p>
                {lang === 'es'
                  ? 'Al ver cómo miles de personas de bajos ingresos perdían sus hogares simplemente por no comprender la jerga legal o los tecnicismos judiciales, el desarrollador dedicó largas noches a programar estas herramientas interactivas: desde el auditor de aumentos y el simulador de mediación, hasta las bitácoras imprimibles y la extensión de Chrome.'
                  : 'Struck by the injustice of low-income families losing their homes due to complex legal jargon, the developer worked late nights implementing these interactive aids: coding localized rent calculators, building the mediation simulator, crafting printable logs, and packaging the Chrome extension.'}
              </p>
              <p>
                {lang === 'es'
                  ? 'El software es 100% de código abierto. Todo el código fuente está disponible públicamente en GitHub para auditoría, transparencia y para que otros desarrolladores colaboren en la expansión de los derechos de vivienda.'
                  : 'The software is 100% open-source and non-commercial. The entire codebase is hosted publicly on GitHub for audit, transparency, and collaboration, allowing other developers to contribute and expand housing protections.'}
              </p>
            </div>
            
            <div className="flex flex-col justify-center items-center p-5 bg-paper border border-rule rounded-lg text-center space-y-4">
              <GithubIcon className="w-12 h-12 text-ink" />
              <div className="text-2xs font-bold text-ink uppercase tracking-wider">
                {lang === 'es' ? 'Proyecto Abierto' : 'Open Source'}
              </div>
              <a 
                href="https://github.com/Iceman-Dann/Right-to-Stay-NJ" 
                target="_blank" 
                rel="noreferrer" 
                className="primary-cta mt-0 py-2 px-3 text-2xs font-bold rounded cursor-pointer active:scale-95 transition"
              >
                {lang === 'es' ? 'Ver en GitHub' : 'View Codebase'}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Story Timeline */}
      <div className="bg-paper border border-rule rounded-xl p-6 md:p-8 mt-12 shadow-sm">
        <h2 className="text-xl font-bold text-ink mb-6 flex items-center gap-2">
          <LocalWrenchIcon className="w-5.5 h-5.5 text-emerald-800" />
          <span>{lang === 'es' ? 'Cómo se Construyó el Proyecto' : 'How the Platform Was Forged'}</span>
        </h2>
        <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-3.5 before:w-0.5 before:bg-rule">
          
          <div className="flex gap-6 relative animate-fade-in">
            <div className="w-7 h-7 bg-ink text-paper rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10">1</div>
            <div>
              <h3 className="font-bold text-sm text-ink">{lang === 'es' ? 'Guías de Avisos Visuales' : 'Visual Summons Decoding'}</h3>
              <p className="text-xs text-margin/90 mt-1 leading-relaxed">
                {lang === 'es'
                  ? 'Decodificamos el formato oficial del estado. Diseñamos diagramas que explican el significado de cada sección de una demanda judicial o citación para eliminar la ansiedad del primer día.'
                  : 'We decoded the official state paperwork. We designed diagrams explaining the exact meaning of every section of a court summons to defuse initial anxiety and clear up confusing deadlines.'}
              </p>
            </div>
          </div>

          <div className="flex gap-6 relative animate-fade-in">
            <div className="w-7 h-7 bg-ink text-paper rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10">2</div>
            <div>
              <h3 className="font-bold text-sm text-ink">{lang === 'es' ? 'Simulaciones y Paquetes de Defensa' : 'Mediation Simulations & Answer Packets'}</h3>
              <p className="text-xs text-margin/90 mt-1 leading-relaxed">
                {lang === 'es'
                  ? 'Agregamos herramientas para calcular saldos y auditar defensas legales. Creamos un simulador interactivo de mediación para que los inquilinos practiquen respuestas frente a abogados y eviten trampas clásicas.'
                  : 'We added ledger calculations and defense audits. We built an interactive mediation roleplay simulator to let tenants practice standing their ground against aggressive landlord lawyers.'}
              </p>
            </div>
          </div>

          <div className="flex gap-6 relative animate-fade-in">
            <div className="w-7 h-7 bg-ink text-paper rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10">3</div>
            <div>
              <h3 className="font-bold text-sm text-ink">{lang === 'es' ? 'Alertas de Juicio y Cartas al Propietario' : 'Calendar Exporters & Official Notices'}</h3>
              <p className="text-xs text-margin/90 mt-1 leading-relaxed">
                {lang === 'es'
                  ? 'Lanzamos el Centro de Cartas para redactar notificaciones de habitabilidad y cese de acoso (N.J.S.A. 2A:39-1). Desarrollamos un exportador de calendarios .ics para programar recordatorios en teléfonos móviles.'
                  : 'We released the Letter Center to draft habitability repairs and cease-and-desist harassment letters (N.J.S.A. 2A:39-1). We developed .ics calendar exporters to push court dates directly to mobile devices.'}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Project Values Section */}
      <div className="grid gap-6 sm:grid-cols-3 mt-12">
        <div className="border border-rule rounded-lg p-5 bg-paper/50 space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
            <LocalFistIcon className="w-4 h-4 text-emerald-800 shrink-0" />
            <span>{lang === 'es' ? 'Independiente' : '100% Independent'}</span>
          </h3>
          <p className="text-xs text-margin leading-relaxed">
            {lang === 'es'
              ? 'No estamos afiliados con el sistema judicial ni con agencias gubernamentales. Somos un recurso comunitario directo apoyado en leyes vigentes.'
              : 'We are not affiliated with the court system or state agencies. We are a direct, community-focused resource backed strictly by public laws.'}
          </p>
        </div>
        <div className="border border-rule rounded-lg p-5 bg-paper/50 space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
            <LocalLockIcon className="w-4 h-4 text-emerald-800 shrink-0" />
            <span>{lang === 'es' ? 'Privado por Diseño' : 'Privacy by Design'}</span>
          </h3>
          <p className="text-xs text-margin leading-relaxed">
            {lang === 'es'
              ? 'Tus datos de alquiler, cálculos financieros e historiales de chat se procesan de forma privada. Nunca rastreamos información personal identificable.'
              : 'Your rent inputs, ledger numbers, and chatbot transcripts are fully private. We never track or store personally identifiable details.'}
          </p>
        </div>
        <div className="border border-rule rounded-lg p-5 bg-paper/50 space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
            <LocalHeartIcon className="w-4 h-4 text-emerald-800 shrink-0" />
            <span>{lang === 'es' ? 'Acceso Gratuito' : 'Free Access'}</span>
          </h3>
          <p className="text-xs text-margin leading-relaxed">
            {lang === 'es'
              ? 'El acceso a la justicia no debería depender de tu billetera. Todas las herramientas y cartas de esta plataforma serán gratuitas para siempre.'
              : "Access to housing justice shouldn't require a credit card. Every tool and letter template on this portal is, and will remain, free forever."}
          </p>
        </div>
      </div>
    </section>
  )
}
