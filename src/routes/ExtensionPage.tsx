import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageIntro, useTranslation } from '../components'

// -----------------------------------
// Inline 1:1 Extension Popup Mockup
// -----------------------------------
function ExtensionMockup() {
  const [activeTab, setActiveTab] = useState<'chat' | 'notice' | 'checklist'>('chat')
  const [lang, setLang] = useState<'en' | 'es'>('en')
  const [messages, setMessages] = useState([
    { role: 'assistant', content: lang === 'es' ? '¡Bienvenido! Soy su asistente de derechos del inquilino de NJ. Pregúnteme sobre avisos de desalojo, sus derechos o el proceso judicial.' : "Welcome! I'm your NJ tenant rights assistant. Ask me anything about eviction notices, your rights, or the court process." }
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [noticeText, setNoticeText] = useState('')
  const [noticeResult, setNoticeResult] = useState('')
  const [analyzingNotice, setAnalyzingNotice] = useState(false)
  const [checklist, setChecklist] = useState([false, false, false])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || sending) return
    const userMsg = { role: 'user', content: trimmed }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setSending(true)
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history: messages.slice(-10), lang })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Sorry, I could not process that.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: lang === 'es' ? 'Error de conexión. Intente de nuevo.' : 'Connection error. Please try again.' }])
    } finally {
      setSending(false)
    }
  }

  const handleExplainNotice = async () => {
    if (!noticeText.trim() || analyzingNotice) return
    setAnalyzingNotice(true)
    setNoticeResult('')
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Please decode and explain this eviction notice in plain language. List the key deadlines, what the tenant must do, and what this does NOT mean:\n\n${noticeText}`,
          history: [],
          lang
        })
      })
      const data = await res.json()
      setNoticeResult(data.reply || 'Unable to analyze notice.')
    } catch {
      setNoticeResult(lang === 'es' ? 'Error al analizar. Intente de nuevo.' : 'Analysis failed. Please try again.')
    } finally {
      setAnalyzingNotice(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const toggleLang = (l: 'en' | 'es') => {
    setLang(l)
    setMessages([{ role: 'assistant', content: l === 'es' ? '¡Bienvenido! Soy su asistente de derechos del inquilino de NJ. Pregúnteme sobre avisos de desalojo, sus derechos o el proceso judicial.' : "Welcome! I'm your NJ tenant rights assistant. Ask me anything about eviction notices, your rights, or the court process." }])
  }

  const toggleCheck = (i: number) => {
    setChecklist(prev => prev.map((v, idx) => idx === i ? !v : v))
  }

  return (
    <div 
      className="border border-rule rounded-xl shadow-lg flex flex-col text-left overflow-hidden mx-auto md:mx-0"
      style={{
        width: '440px',
        minHeight: '580px',
        maxHeight: '640px',
        background: 'var(--color-paper)',
        color: 'var(--color-ink)',
      }}
    >
      {/* Mockup Header */}
      <div className="bg-white px-4 py-3 flex items-center gap-3 border-b border-rule sticky top-0 z-50">
        <div className="w-8 h-8 bg-ink rounded-lg flex items-center justify-center shrink-0">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
        </div>
        <div>
          <h1 className="text-sm font-extrabold tracking-tight m-0 p-0 text-ink" style={{ fontSize: '15px' }}>Right to Stay NJ</h1>
          <p className="text-4xs text-margin font-bold uppercase tracking-wider mt-0.5" style={{ fontSize: '10px' }}>AI Tenant Assistant</p>
        </div>
        <div className="ml-auto flex border border-rule rounded-md overflow-hidden bg-white">
          {(['en', 'es'] as const).map(l => (
            <button key={l} onClick={() => toggleLang(l)} className={`px-2 py-1 text-4xs font-bold border-none cursor-pointer transition ${lang === l ? 'bg-ink text-paper' : 'bg-transparent text-slate-500 hover:bg-rule/20'}`} style={{ fontSize: '10px' }}>{l.toUpperCase()}</button>
          ))}
        </div>
      </div>

      {/* Emergency Lockout Banner */}
      <div className="bg-red-950 text-red-100 px-4 py-2 text-3xs font-bold flex items-start gap-1.5 border-b border-red-900" style={{ fontSize: '10.5px' }}>
        <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
        <span className="leading-relaxed"><strong>{lang === 'es' ? '¿Están cambiando sus cerraduras?' : 'Locked out?'}</strong> {lang === 'es' ? ' Un propietario que cambia cerraduras sin una orden de desalojo formal viola N.J.S.A. 2A:39-1. Llame al 911.' : ' A landlord changing locks without a court officer violates N.J.S.A. 2A:39-1. Call 911.'}</span>
      </div>

      {/* Disclaimer Banner */}
      <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 text-3xs text-amber-800" style={{ fontSize: '10.5px' }}>
        <strong>{lang === 'es' ? 'Información general, no asesoría legal.' : 'General info, not legal advice.'}</strong>
        {' '}{lang === 'es' ? 'Llame a LSNJLAW gratis:' : 'Call LSNJLAW free:'} <strong><a href="tel:18885765529" className="text-amber-900 font-semibold underline">1-888-576-5529</a></strong>
      </div>

      {/* Tabs Row */}
      <div className="flex gap-1.5 px-3 py-2 border-b border-rule bg-white">
        {([
          { id: 'chat' as const, icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379L12 21.75V16.5m-6-12h10.5A2.25 2.25 0 0118.75 6.75V16.5a2.25 2.25 0 01-2.25 2.25H12h-3L3.75 21.75V16.5a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 013.75 4.5z" /></svg>, label: lang === 'es' ? 'Preguntar' : 'Ask a Question' },
          { id: 'notice' as const, icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>, label: lang === 'es' ? 'Explicar Aviso' : 'Explain Notice' },
          { id: 'checklist' as const, icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 0A48.536 48.536 0 0112 3m0 0c2.917 0 5.747.294 8.5.862" /></svg>, label: lang === 'es' ? 'Mi Lista' : 'My Checklist' },
        ]).map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex-1 py-2 px-1 text-3xs font-bold text-center cursor-pointer border rounded-lg transition-all flex items-center justify-center gap-1 ${activeTab === t.id ? 'bg-margin/10 border-margin/20 text-margin opacity-100' : 'bg-transparent border-transparent text-ink opacity-60 hover:opacity-100 hover:bg-ink/5'}`} style={{ fontSize: '11.5px' }}>
            {t.icon}<span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Chat Tab Body */}
      {activeTab === 'chat' && (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3" style={{ minHeight: '240px', maxHeight: '340px', background: 'var(--color-paper)' }}>
            {messages.map((m, i) => (
              <div 
                key={i} 
                className={`max-w-[88%] px-3.5 py-2.5 rounded-xl text-xs md:text-sm leading-relaxed ${m.role === 'user' ? 'bg-ink text-white self-end rounded-br-sm' : 'bg-white text-ink border border-rule self-start rounded-bl-sm shadow-sm'}`}
                style={{ fontSize: '12.5px' }}
              >
                {m.content}
              </div>
            ))}
            {sending && (
              <div className="max-w-[88%] px-3.5 py-2.5 rounded-xl bg-white border border-rule self-start rounded-bl-sm shadow-sm">
                <div className="flex gap-1 items-center h-3.5">
                  {[0, 0.15, 0.3].map((delay, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-rule animate-bounce" style={{ animationDelay: `${delay}s`, width: 6, height: 6 }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {/* Chat input row */}
          <div className="flex gap-2 p-3 border-t border-rule bg-white">
            <textarea 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyDown={handleKeyDown} 
              rows={1} 
              placeholder={lang === 'es' ? 'Pregunte sobre sus derechos...' : 'Ask about your rights...'} 
              className="flex-1 px-3 py-2 border border-rule rounded-lg text-xs md:text-sm outline-none resize-none bg-white text-ink focus:border-margin focus:ring-2 focus:ring-margin/10 transition" 
              style={{ height: '38px', fontSize: '12.5px', fontFamily: 'inherit' }} 
            />
            <button 
              onClick={handleSend} 
              disabled={sending || !input.trim()} 
              className="px-4 py-2 bg-ink text-white border-none rounded-lg text-xs font-bold cursor-pointer transition hover:bg-margin active:scale-97 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{ fontSize: '12.5px' }}
            >
              {lang === 'es' ? 'Enviar' : 'Send'}
            </button>
          </div>
        </div>
      )}

      {/* Notice Tab Body */}
      {activeTab === 'notice' && (
        <div className="p-4 flex flex-col gap-3 overflow-y-auto" style={{ maxHeight: '450px' }}>
          <textarea 
            value={noticeText} 
            onChange={e => setNoticeText(e.target.value)} 
            placeholder={lang === 'es' ? 'Pegue el texto de su aviso de desalojo aquí...' : 'Paste the text from your eviction notice here...'} 
            className="w-full h-28 p-3 border border-rule rounded-lg text-xs leading-relaxed resize-none outline-none bg-white text-ink focus:border-margin focus:ring-2 focus:ring-margin/10 transition"
            style={{ fontFamily: 'inherit' }}
          />
          <button 
            onClick={handleExplainNotice} 
            disabled={analyzingNotice || !noticeText.trim()} 
            className="py-2.5 px-4 bg-stamp text-white border-none rounded-lg text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 transition active:scale-97 hover:bg-ink disabled:opacity-55 disabled:cursor-not-allowed disabled:transform-none shadow-sm"
            style={{ fontSize: '12.5px' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.602 10.602z" /></svg>
            {analyzingNotice ? (lang === 'es' ? 'Analizando...' : 'Analyzing...') : (lang === 'es' ? 'Explicar Aviso' : 'Explain Notice')}
          </button>
          {noticeResult && (
            <div className="bg-white border border-rule rounded-lg p-3.5 text-xs md:text-sm leading-relaxed max-h-56 overflow-y-auto text-ink shadow-inner">
              {noticeResult}
            </div>
          )}
        </div>
      )}

      {/* Checklist Tab Body */}
      {activeTab === 'checklist' && (
        <div className="p-4 flex flex-col gap-3 overflow-y-auto" style={{ maxHeight: '450px' }}>
          <h3 className="text-xs font-bold text-ink" style={{ fontSize: '13px' }}>{lang === 'es' ? 'Su Lista de Defensa' : 'Your Eviction Defense Checklist'}</h3>
          <p className="text-3xs text-slate-500 leading-relaxed" style={{ fontSize: '11.5px' }}>{lang === 'es' ? 'Marque los pasos completados para mantenerse en camino.' : 'Check off completed steps to stay on track.'}</p>
          {[
            lang === 'es' ? 'Llame a LSNJLAW al 1-888-576-5529' : 'Call LSNJLAW Legal Aid hotline at 1-888-576-5529',
            lang === 'es' ? 'Reúna todos los recibos de renta, estados de cuenta bancarios y registros de pago.' : 'Gather all rent receipts, bank statements, lease contracts, and payment records.',
            lang === 'es' ? 'Fotografíe cualquier documento publicado en su puerta con prueba de fecha y hora.' : 'Photograph any document/notice posted on your door with date and time proof.',
          ].map((label, i) => (
            <label 
              key={i} 
              className={`flex gap-2 items-start bg-white p-2.5 border border-rule rounded-lg text-xs leading-normal cursor-pointer select-none transition ${checklist[i] ? 'line-through text-slate-400' : 'text-ink hover:bg-slate-50'}`}
            >
              <input 
                type="checkbox" 
                checked={checklist[i]} 
                onChange={() => toggleCheck(i)} 
                className="mt-0.5 cursor-pointer"
                style={{ accentColor: 'var(--color-margin)' }}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      )}

      {/* Footer Row */}
      <div className="px-4 py-2.5 border-t border-rule bg-white flex justify-between items-center">
        <span className="text-4xs text-slate-500 font-medium" style={{ fontSize: '10px' }}>{lang === 'es' ? 'No es asesoría legal • Solo ley de NJ' : 'Not legal advice • NJ law only'}</span>
        <Link to="/ai-assistant" className="text-3xs font-bold text-margin hover:underline" style={{ fontSize: '10.5px' }}>{lang === 'es' ? 'Abrir app →' : 'Open Full App →'}</Link>
      </div>
    </div>
  )
}

// -----------------------------------
// Feature Cards
// -----------------------------------
function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="border border-rule rounded-xl p-6 bg-white/60 shadow-sm hover:bg-white transition duration-200 cursor-default">
      <div className="w-11 h-11 bg-margin/10 text-margin rounded-lg flex items-center justify-center mb-4.5">
        {icon}
      </div>
      <h3 className="text-base font-bold text-ink mb-2">{title}</h3>
      <p className="text-sm text-ink/75 leading-relaxed">{desc}</p>
    </div>
  )
}

// -----------------------------------
// Main Extension Page Component
// -----------------------------------
export function ExtensionPage() {
  const { lang } = useTranslation()
  const isEs = lang === 'es'

  const features = [
    {
      icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379L12 21.75V16.5m-6-12h10.5A2.25 2.25 0 0118.75 6.75V16.5a2.25 2.25 0 01-2.25 2.25H12h-3L3.75 21.75V16.5a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 013.75 4.5z" /></svg>,
      title: isEs ? 'Asistente de IA en vivo' : 'Live AI Chat Assistant',
      desc: isEs ? 'Haga cualquier pregunta sobre sus derechos como inquilino de NJ en inglés o español y obtenga respuestas claras y legales al instante.' : 'Ask any question about your NJ tenant rights in English or Spanish and get instant, plain-language legal guidance backed by NJ law.',
    },
    {
      icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
      title: isEs ? 'Decodificador de avisos' : 'Notice Decoder',
      desc: isEs ? 'Pegue el texto de cualquier aviso de desalojo para obtener un desglose en lenguaje simple de plazos, derechos y próximos pasos.' : 'Paste any eviction notice text and get a plain-English breakdown of deadlines, rights, and next steps in seconds.',
    },
    {
      icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" /></svg>,
      title: isEs ? 'Explicar con clic derecho' : 'Right-Click Explain',
      desc: isEs ? 'Resalte cualquier cláusula de arrendamiento o jerga legal en cualquier página web, haga clic derecho y obtenga una explicación instantánea.' : 'Highlight any lease clause or legal jargon on any webpage, right-click, and get an instant plain-language explanation.',
    },
    {
      icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" /></svg>,
      title: isEs ? 'Completamente bilingüe' : 'Fully Bilingual',
      desc: isEs ? 'Cambie entre inglés y español con un solo clic. Toda la interfaz, el chat de IA y los recursos se traducen al instante.' : 'Switch between English and Spanish with one click. The entire interface, AI chat, and resources translate instantly.',
    },
    {
      icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
      title: isEs ? '100% privado' : '100% Private',
      desc: isEs ? 'Sus datos nunca salen de su navegador. Sin cuentas, sin seguimiento, sin subida de documentos a servidores.' : 'Your data never leaves your browser. No accounts, no tracking, no documents uploaded to servers. Privacy-first by design.',
    },
    {
      icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      title: isEs ? 'Completamente gratis' : 'Completely Free',
      desc: isEs ? 'Cero costos. Sin paywalls, sin suscripciones, sin anuncios. Herramientas de defensa de inquilinos profesionales para todos.' : 'Zero cost. No paywalls, no subscriptions, no ads. Professional-grade tenant defense tools accessible to everyone.',
    },
  ]

  const steps = [
    { num: '1', title: isEs ? 'Instale la extensión' : 'Install the Extension', desc: isEs ? 'Añada Right to Stay NJ a Chrome desde la tienda web. Gratis, sin cuenta requerida.' : 'Add Right to Stay NJ to Chrome from the Web Store. Free, no account required.' },
    { num: '2', title: isEs ? 'Haga clic en el icono' : 'Click the Icon', desc: isEs ? 'El asistente aparece de inmediato en una ventana emergente, listo para ayudarle.' : 'The assistant pops up immediately in a compact window, ready to help you.' },
    { num: '3', title: isEs ? 'Obtenga respuestas' : 'Get Answers', desc: isEs ? 'Escriba su pregunta, pegue su aviso o resalte texto en cualquier página para obtener orientación legal instantánea.' : 'Type your question, paste your notice, or highlight text on any page for instant legal guidance.' },
  ]

  return (
    <section className="shell page-section">
      
      {/* Page Header Introduction */}
      <PageIntro 
        eyebrow={isEs ? 'Extensión de Navegador' : 'Browser Extension'} 
        title={isEs ? 'Su asistente legal, siempre a su alcance' : 'Your Legal Assistant, Always at Hand'}
      >
        <p>
          {isEs
            ? 'El asistente de derechos de inquilinos de NJ impulsado por IA que funciona directamente en su navegador. Explique avisos, pregunte sobre sus derechos y obtenga orientación legal instantánea, sin importar en qué página esté.'
            : 'The AI-powered NJ tenant rights assistant that works directly in your browser. Decode notices, ask about your rights, and get instant legal guidance — no matter what page you\'re on.'}
        </p>
      </PageIntro>

      {/* Hero Layout: Action details + Live Mockup */}
      <div className="grid gap-12 md:grid-cols-2 items-center mt-12 border-b border-rule pb-16">
        
        {/* Left Column: Promotion Info */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 bg-margin/10 border border-margin/20 rounded-full px-4 py-1.5">
            <span className="w-2 h-2 rounded-full bg-margin animate-pulse" />
            <span className="text-xs font-bold text-margin uppercase tracking-wider">{isEs ? 'Extensión de Chrome • Gratis' : 'Chrome Extension • Free'}</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-ink leading-tight">
            {isEs 
              ? 'Tome control de su defensa desde cualquier página web' 
              : 'Take Control of Your Defense from Any Webpage'}
          </h2>

          <p className="text-sm md:text-base text-ink/80 leading-relaxed max-w-lg">
            {isEs
              ? 'Nuestra extensión de navegador pone todo el poder de Right to Stay NJ en su barra de herramientas. Resalte cláusulas complejas en correos, contratos de arrendamiento o portales de la corte para decodificarlas instantáneamente.'
              : 'Our browser extension puts the full power of Right to Stay NJ directly into your toolbar. Highlight complex clauses in emails, lease contracts, or court portals to decode them instantly.'}
          </p>

          {/* Action Links using layout buttons */}
          <div className="flex flex-wrap gap-4 pt-4">
            <a
              href="https://github.com/Iceman-Dann/Right-to-Stay-NJ"
              target="_blank"
              rel="noopener noreferrer"
              className="primary-cta mt-0"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
              <span>{isEs ? 'Ver en GitHub' : 'View on GitHub'}</span>
            </a>
            <Link
              to="/support"
              className="secondary-button inline-flex items-center justify-center gap-2"
            >
              <span>{isEs ? 'Centro de Soporte' : 'Support Center'}</span>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-ink/60 font-semibold">
            <div className="flex items-center gap-1">🎁 {isEs ? '100% Gratis' : '100% Free'}</div>
            <div className="flex items-center gap-1">🔓 {isEs ? 'Código Abierto' : 'Open Source'}</div>
            <div className="flex items-center gap-1">🔒 {isEs ? 'Privacidad Absoluta' : 'Privacy First'}</div>
          </div>
        </div>

        {/* Right Column: Interactive Mockup Card */}
        <div className="flex justify-center md:justify-end">
          <div className="relative">
            <div className="absolute -inset-4 bg-margin/5 rounded-2xl blur-xl pointer-events-none" />
            <div className="relative">
              <ExtensionMockup />
            </div>
          </div>
        </div>

      </div>

      {/* How it works Section */}
      <div className="py-16 border-b border-rule">
        <div className="text-center mb-12">
          <span className="eyebrow">{isEs ? 'Paso a paso' : 'Step-by-Step'}</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-ink mt-2">{isEs ? 'Instalación y Uso Simple' : 'Simple Installation & Usage'}</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={i} className="border border-rule rounded-lg p-6 bg-white/60 shadow-sm relative">
              <div className="w-12 h-12 rounded-lg bg-margin/10 border border-margin/20 flex items-center justify-center text-xl font-bold text-margin mb-4">{s.num}</div>
              <h3 className="text-base font-bold text-ink mb-2">{s.title}</h3>
              <p className="text-xs md:text-sm text-ink/75 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid Section */}
      <div className="py-16">
        <div className="text-center mb-12">
          <span className="eyebrow">{isEs ? 'Características Clave' : 'Key Features'}</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-ink mt-2">{isEs ? 'Tome el control de su defensa' : 'Take Control of Your Defense'}</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {features.map((f, i) => <FeatureCard key={i} {...f} />)}
        </div>
      </div>

      {/* Footer CTA Banner */}
      <div className="border-t border-rule py-16 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-ink">
            {isEs ? 'Comience a proteger su hogar hoy' : 'Start Protecting Your Home Today'}
          </h2>
          <p className="text-xs md:text-sm text-ink/75 leading-relaxed max-w-lg mx-auto">
            {isEs 
              ? 'Nuestra extensión es libre de costos, libre de anuncios y nunca recopila ni transmite sus datos. Es el compañero de defensa legal definitivo.' 
              : 'Our extension is free of cost, free of ads, and never collects or transmits your data. It is the ultimate legal defense companion.'}
          </p>
          <div className="flex justify-center gap-4 pt-6">
            <a
              href="https://github.com/Iceman-Dann/Right-to-Stay-NJ"
              target="_blank"
              rel="noopener noreferrer"
              className="primary-cta mt-0"
            >
              <span>{isEs ? 'Obtener en GitHub' : 'Get it on GitHub'}</span>
            </a>
            <Link to="/support" className="secondary-button inline-flex items-center justify-center">
              <span>{isEs ? 'Soporte Técnico' : 'Technical Support'}</span>
            </Link>
          </div>
        </div>
      </div>

    </section>
  )
}
