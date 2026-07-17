import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from '../components'

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
    <div style={{
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      width: '440px',
      minHeight: '580px',
      maxHeight: '640px',
      background: '#F7F5EF',
      color: '#17243A',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 32px 80px rgba(23,36,58,0.28), 0 8px 24px rgba(23,36,58,0.12)',
    }}>

      {/* Header */}
      <div style={{ background: '#fff', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1.5px solid #DDD8C4', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ width: 32, height: 32, background: '#17243A', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>Right to Stay NJ</div>
          <div style={{ fontSize: 10, color: '#2D6A4F', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 1 }}>AI Tenant Assistant</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', border: '1.5px solid #DDD8C4', borderRadius: 6, overflow: 'hidden', background: 'white' }}>
          {(['en', 'es'] as const).map(l => (
            <button key={l} onClick={() => toggleLang(l)} style={{ padding: '4px 8px', fontSize: 10, fontWeight: 700, border: 'none', cursor: 'pointer', background: lang === l ? '#17243A' : 'transparent', color: lang === l ? 'white' : '#64748b', transition: 'all 0.15s' }}>{l.toUpperCase()}</button>
          ))}
        </div>
      </div>

      {/* Emergency Banner */}
      <div style={{ background: 'linear-gradient(90deg, #7f1d1d 0%, #991b1b 50%, #7f1d1d 100%)', color: '#fff7f7', padding: '8px 14px', fontSize: '10.5px', fontWeight: 700, lineHeight: 1.45, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
        <svg style={{ width: 14, height: 14, marginTop: 1.5, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
        <span style={{ flex: 1, marginLeft: 4 }}><strong>{lang === 'es' ? '¿Están cambiando sus cerraduras?' : 'Locked out?'}</strong> {lang === 'es' ? ' Un propietario que cambia cerraduras sin una orden judicial viola N.J.S.A. 2A:39-1. Llame al 911.' : ' A landlord changing locks without a court officer violates N.J.S.A. 2A:39-1. Call 911.'}</span>
      </div>

      {/* Disclaimer */}
      <div style={{ background: '#FFFBEB', borderBottom: '1px solid #FEF3C7', padding: '8px 16px', fontSize: '10.5px', color: '#92400E', lineHeight: 1.45 }}>
        <strong>{lang === 'es' ? 'Información general, no asesoría legal.' : 'General info, not legal advice.'}</strong>
        {' '}{lang === 'es' ? 'Llame a LSNJLAW gratis:' : 'Call LSNJLAW free:'} <strong><a href="tel:18885765529" style={{ color: '#92400e' }}>1-888-576-5529</a></strong>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, padding: '8px 12px', borderBottom: '1px solid #DDD8C4', background: '#fff' }}>
        {([
          { id: 'chat' as const, icon: <svg style={{ width: 13, height: 13 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379L12 21.75V16.5m-6-12h10.5A2.25 2.25 0 0118.75 6.75V16.5a2.25 2.25 0 01-2.25 2.25H12h-3L3.75 21.75V16.5a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 013.75 4.5z" /></svg>, label: lang === 'es' ? 'Preguntar' : 'Ask a Question' },
          { id: 'notice' as const, icon: <svg style={{ width: 13, height: 13 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>, label: lang === 'es' ? 'Explicar Aviso' : 'Explain Notice' },
          { id: 'checklist' as const, icon: <svg style={{ width: 13, height: 13 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 0A48.536 48.536 0 0112 3m0 0c2.917 0 5.747.294 8.5.862" /></svg>, label: lang === 'es' ? 'Mi Lista' : 'My Checklist' },
        ]).map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, padding: '8px 6px', fontSize: '11.5px', fontWeight: 700, textAlign: 'center', cursor: 'pointer', border: `1.5px solid ${activeTab === t.id ? 'rgba(45,106,79,0.15)' : 'transparent'}`, background: activeTab === t.id ? 'rgba(45,106,79,0.09)' : 'transparent', color: activeTab === t.id ? '#2D6A4F' : '#17243A', opacity: activeTab === t.id ? 1 : 0.55, borderRadius: 8, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            {t.icon}<span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 240, maxHeight: 340, background: '#F7F5EF' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ maxWidth: '88%', padding: '10px 14px', borderRadius: 12, fontSize: '12.5px', lineHeight: 1.55, alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', background: m.role === 'user' ? 'linear-gradient(135deg,#17243A 0%,#0F1A28 100%)' : 'white', color: m.role === 'user' ? 'white' : '#17243A', border: m.role === 'assistant' ? '1.5px solid #DDD8C4' : 'none', borderBottomRightRadius: m.role === 'user' ? 3 : 12, borderBottomLeftRadius: m.role === 'assistant' ? 3 : 12 }}>
                {m.content}
              </div>
            ))}
            {sending && (
              <div style={{ maxWidth: '88%', padding: '10px 14px', borderRadius: 12, background: 'white', border: '1.5px solid #DDD8C4', alignSelf: 'flex-start', borderBottomLeftRadius: 3 }}>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center', height: 14 }}>
                  {[0, 0.15, 0.3].map((delay, i) => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#DDD8C4', animation: `bounce 1.2s ease-in-out ${delay}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div style={{ display: 'flex', gap: 8, padding: '12px 16px 16px', borderTop: '1px solid #DDD8C4', background: 'white' }}>
            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} rows={1} placeholder={lang === 'es' ? 'Pregunte sobre sus derechos...' : 'Ask about your rights...'} style={{ flex: 1, padding: '10px 12px', border: '1.5px solid #DDD8C4', borderRadius: 8, fontSize: '12.5px', fontFamily: 'inherit', outline: 'none', resize: 'none', height: 38, color: '#17243A' }} />
            <button onClick={handleSend} disabled={sending || !input.trim()} style={{ padding: '8px 16px', background: '#17243A', color: 'white', border: 'none', borderRadius: 8, fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', opacity: (sending || !input.trim()) ? 0.5 : 1 }}>{lang === 'es' ? 'Enviar' : 'Send'}</button>
          </div>
        </div>
      )}

      {/* Notice Tab */}
      {activeTab === 'notice' && (
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', maxHeight: 450 }}>
          <textarea value={noticeText} onChange={e => setNoticeText(e.target.value)} placeholder={lang === 'es' ? 'Pegue el texto de su aviso de desalojo aquí...' : 'Paste the text from your eviction notice here...'} style={{ width: '100%', height: 110, padding: 12, border: '1.5px solid #DDD8C4', borderRadius: 8, fontSize: 12, lineHeight: 1.55, resize: 'none', fontFamily: 'inherit', outline: 'none', background: 'white', color: '#17243A' }} />
          <button onClick={handleExplainNotice} disabled={analyzingNotice || !noticeText.trim()} style={{ padding: 11, background: analyzingNotice || !noticeText.trim() ? '#DDD8C4' : 'linear-gradient(135deg, #B5531A 0%, #8B3A0F 100%)', color: 'white', border: 'none', borderRadius: 8, fontSize: '12.5px', fontWeight: 700, cursor: (analyzingNotice || !noticeText.trim()) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.602 10.602z" /></svg>
            {analyzingNotice ? (lang === 'es' ? 'Analizando...' : 'Analyzing...') : (lang === 'es' ? 'Explicar Aviso' : 'Explain Notice')}
          </button>
          {noticeResult && (
            <div style={{ background: 'white', border: '1.5px solid #DDD8C4', borderRadius: 8, padding: 14, fontSize: '12.5px', lineHeight: 1.6, maxHeight: 220, overflowY: 'auto', color: '#17243A' }}>
              {noticeResult}
            </div>
          )}
        </div>
      )}

      {/* Checklist Tab */}
      {activeTab === 'checklist' && (
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', maxHeight: 450 }}>
          <h3 style={{ fontSize: 13, fontWeight: 800, color: '#17243A' }}>{lang === 'es' ? 'Su Lista de Defensa' : 'Your Eviction Defense Checklist'}</h3>
          <p style={{ fontSize: '11.5px', color: '#64748b', lineHeight: 1.45 }}>{lang === 'es' ? 'Marque los pasos completados para mantenerse en camino.' : 'Check off completed steps to stay on track.'}</p>
          {[
            lang === 'es' ? 'Llame a LSNJLAW al 1-888-576-5529' : 'Call LSNJLAW Legal Aid hotline at 1-888-576-5529',
            lang === 'es' ? 'Reúna todos los recibos de renta, estados de cuenta bancarios y registros de pago.' : 'Gather all rent receipts, bank statements, lease contracts, and payment records.',
            lang === 'es' ? 'Fotografíe cualquier documento publicado en su puerta con prueba de fecha y hora.' : 'Photograph any document/notice posted on your door with date and time proof.',
          ].map((label, i) => (
            <label key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: 'white', padding: 10, border: '1.5px solid #DDD8C4', borderRadius: 8, fontSize: 12, lineHeight: 1.4, cursor: 'pointer', textDecoration: checklist[i] ? 'line-through' : 'none', color: checklist[i] ? '#94a3b8' : '#17243A' }}>
              <input type="checkbox" checked={checklist[i]} onChange={() => toggleCheck(i)} style={{ marginTop: 2.5, cursor: 'pointer', accentColor: '#2D6A4F' }} />
              <span>{label}</span>
            </label>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: '10px 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #DDD8C4', background: '#fff' }}>
        <span style={{ fontSize: 10, color: '#64748b', fontWeight: 500 }}>{lang === 'es' ? 'No es asesoría legal • Solo ley de NJ' : 'Not legal advice • NJ law only'}</span>
        <Link to="/ai-assistant" style={{ fontSize: '10.5px', fontWeight: 700, color: '#2D6A4F', textDecoration: 'none' }}>{lang === 'es' ? 'Abrir app →' : 'Open Full App →'}</Link>
      </div>

      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0);opacity:.5}40%{transform:translateY(-4px);opacity:1} }`}</style>
    </div>
  )
}

// -----------------------------------
// Feature Cards
// -----------------------------------
function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '24px 20px', backdropFilter: 'blur(8px)', transition: 'background 0.2s', cursor: 'default' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
    >
      <div style={{ width: 44, height: 44, background: 'rgba(45,106,79,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, color: '#6ee7b7' }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65 }}>{desc}</p>
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
    <div style={{ minHeight: '100vh', background: '#0f1a28', color: 'white', fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>

      {/* Hero Section */}
      <div style={{ position: 'relative', overflow: 'hidden', paddingTop: 80, paddingBottom: 80 }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(45,106,79,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          
          {/* Left: Hero copy */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(45,106,79,0.15)', border: '1px solid rgba(45,106,79,0.3)', borderRadius: 100, padding: '6px 14px', marginBottom: 24 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#6ee7b7', display: 'inline-block', boxShadow: '0 0 8px #6ee7b7' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#6ee7b7', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{isEs ? 'Chrome Extension • Gratis' : 'Chrome Extension • Free'}</span>
            </div>

            <h1 style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.03em', marginBottom: 20, background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {isEs ? 'Sus derechos,\nsiempre\na su alcance.' : 'Your rights,\nalways at\nyour fingertips.'}
            </h1>

            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, marginBottom: 36, maxWidth: 480 }}>
              {isEs
                ? 'El asistente de derechos de inquilinos de NJ impulsado por IA que funciona directamente en su navegador. Explique avisos, pregunte sobre sus derechos y obtenga orientación legal instantánea, sin importar en qué página esté.'
                : 'The AI-powered NJ tenant rights assistant that works directly in your browser. Decode notices, ask about your rights, and get instant legal guidance — no matter what page you\'re on.'}
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a
                href="https://github.com/Iceman-Dann/Right-to-Stay-NJ"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#2D6A4F', color: 'white', padding: '14px 26px', borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(45,106,79,0.4)' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#1a4a37'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#2D6A4F'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
                {isEs ? 'Ver en GitHub' : 'View on GitHub'}
              </a>
              <a
                href="https://www.righttostaynj.org/support"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)', padding: '14px 26px', borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                {isEs ? '¿Necesita ayuda?' : 'Need Support?'}
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 32 }}>
              {[
                { label: isEs ? '100% Gratis' : '100% Free', icon: '🎁' },
                { label: isEs ? 'Código abierto' : 'Open Source', icon: '🔓' },
                { label: isEs ? 'Privacidad primero' : 'Privacy First', icon: '🔒' },
              ].map(b => (
                <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>
                  <span>{b.icon}</span><span>{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Live Extension Mockup */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative' }}>
              {/* Glow behind popup */}
              <div style={{ position: 'absolute', inset: -40, background: 'radial-gradient(ellipse at center, rgba(45,106,79,0.2) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <ExtensionMockup />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#6ee7b7', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>{isEs ? 'Cómo funciona' : 'How it works'}</p>
          <h2 style={{ fontSize: 38, fontWeight: 900, letterSpacing: '-0.03em', color: 'white' }}>{isEs ? 'Ayuda legal en 3 pasos' : 'Legal help in 3 steps'}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ position: 'relative', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '32px 28px' }}>
              {i < steps.length - 1 && <div style={{ position: 'absolute', right: -13, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.15)', fontSize: 24, zIndex: 2 }}>›</div>}
              <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, rgba(45,106,79,0.4), rgba(45,106,79,0.1))', border: '1px solid rgba(45,106,79,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: '#6ee7b7', marginBottom: 20 }}>{s.num}</div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'white', marginBottom: 10 }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#6ee7b7', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>{isEs ? 'Características' : 'Features'}</p>
          <h2 style={{ fontSize: 38, fontWeight: 900, letterSpacing: '-0.03em', color: 'white' }}>{isEs ? 'Todo lo que necesita, ahí mismo' : 'Everything you need, right there'}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {features.map((f, i) => <FeatureCard key={i} {...f} />)}
        </div>
      </div>

      {/* CTA Banner */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 42, fontWeight: 900, letterSpacing: '-0.03em', color: 'white', marginBottom: 16 }}>
            {isEs ? 'Conozca sus derechos hoy.' : 'Know your rights today.'}
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, marginBottom: 36 }}>
            {isEs ? 'Gratis para cada inquilino de NJ. Sin cuentas. Sin suscripciones. Solo orientación legal clara cuando más la necesita.' : 'Free for every NJ tenant. No accounts. No subscriptions. Just clear legal guidance when you need it most.'}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="https://github.com/Iceman-Dann/Right-to-Stay-NJ"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#2D6A4F', color: 'white', padding: '16px 32px', borderRadius: 14, fontWeight: 800, fontSize: 16, textDecoration: 'none', boxShadow: '0 4px 24px rgba(45,106,79,0.5)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(45,106,79,0.6)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(45,106,79,0.5)' }}
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
              {isEs ? 'Obtener en GitHub' : 'Get it on GitHub'}
            </a>
            <Link to="/support" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)', padding: '16px 32px', borderRadius: 14, fontWeight: 800, fontSize: 16, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)', transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.14)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)' }}
            >
              {isEs ? 'Centro de ayuda' : 'Help Center'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
