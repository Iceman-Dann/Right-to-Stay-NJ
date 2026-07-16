import { useState, useEffect } from 'react'
import { PageIntro, useTranslation } from '../components'
import { menuText } from '../data/sms'

export function TextHelp() {
  const { t, lang } = useTranslation()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  
  const localMenuText = lang === 'es' 
    ? "Responda con el título de su documento, o un número:\n1 Aviso de Desalojo / Aviso de Cese\n2 Demanda de Evicción\n3 Citación de la Corte\n4 Fallo de Posesión\n5 Orden de Lanzamiento (Desalojo)"
    : menuText

  const [reply, setReply] = useState(localMenuText)

  useEffect(() => {
    setReply(localMenuText)
  }, [lang])

  async function sendDemo() {
    if (!message.trim() || loading) return
    setLoading(true)
    try {
      const response = await fetch('/api/text-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, lang })
      })
      if (!response.ok) throw new Error('Server returned error')
      const data = await response.json()
      setReply(data.reply)
    } catch (err) {
      setReply(
        lang === 'es'
          ? 'Error de comunicación con el servidor. El servicio de chat requiere una conexión activa con la base de datos.'
          : 'Server connection error. The chat service requires a database connection to record the action.'
      )
    } finally {
      setLoading(false)
      setMessage('')
    }
  }

  return (
    <section className="shell page-section">
      <PageIntro eyebrow={t('text_eyebrow')} title={t('text_title')}>
        <p>{t('text_desc')}</p>
      </PageIntro>

      <div className="disclaimer bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-8 text-sm">
        <strong>{lang === 'es' ? 'Simulador conectado al servidor' : 'Simulator connected to server'}</strong>
        <p className="mt-1">
          {lang === 'es' 
            ? 'Las respuestas son clasificadas en tiempo real por el backend y registradas de forma agregada en la base de datos de impacto.' 
            : 'Replies are classified in real-time by the backend and logged in the aggregate impact database.'}
        </p>
      </div>

      <div className="feature-grid mt-12 grid gap-8 md:grid-cols-2">
        <div>
          <h2>{t('text_expect_title')}</h2>
          <ol className="number-list list-decimal pl-5 space-y-3 mt-4 text-sm">
            <li>{t('text_expect_1')}</li>
            <li>{t('text_expect_2')}</li>
            <li>{t('text_expect_3')}</li>
          </ol>
          <p className="mt-5 text-sm leading-6 text-margin">{t('text_privacy_tip')}</p>
        </div>

        <div className="sms-demo bg-rule/10 border border-rule rounded-lg p-6 flex flex-col justify-between" aria-label="Text help preview">
          <div>
            <p className="eyebrow uppercase text-xs tracking-wider mb-4">{t('text_demo_title')}</p>
            <div className="sms-bubble bg-ink text-paper p-4 rounded-lg text-sm whitespace-pre-wrap leading-relaxed shadow-sm">
              {reply}
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="sms-message" className="block text-xs font-bold text-margin uppercase mb-2">
              {t('text_input_label')}
            </label>
            <div className="input-row flex gap-2">
              <input
                id="sms-message"
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) sendDemo()
                }}
                disabled={loading}
                className="flex-1 p-2 border border-rule bg-paper rounded text-sm"
                placeholder={t('text_input_placeholder')}
              />
              <button
                onClick={sendDemo}
                disabled={!message.trim() || loading}
                className="primary-cta mt-0 py-2 px-4 cursor-pointer text-sm font-semibold active:scale-95 transition"
              >
                {loading ? t('loading') : t('text_btn_send')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="privacy-box mt-12 border-t border-rule pt-8">
        <h2>{t('text_privacy_title')}</h2>
        <p className="mt-4 text-sm leading-7 text-margin">{t('text_privacy_desc')}</p>
      </div>
    </section>
  )
}
