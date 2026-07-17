import { PageIntro, useTranslation } from '../components'
import { useState } from 'react'

const supportContent = {
  en: {
    eyebrow: 'Get Assistance & Report Issues',
    title: 'Chrome Extension Support Center',
    desc: 'If you are experiencing issues with the Right to Stay NJ Chrome extension, find troubleshooting guides below or contact us directly on GitHub.',
    
    // Status indicators
    status_title: 'System Status',
    status_ai: 'AI Assistance API',
    status_db: 'Notice Analytics API',
    status_ext: 'Browser Extension Services',
    status_online: 'Online',
    status_operational: 'Operational',

    // FAQ Accordion
    faq_title: 'Frequently Asked Questions',
    faq_q1: 'How do I install the extension?',
    faq_a1: 'To install the extension during developer testing, open Chrome and go to `chrome://extensions`. Enable "Developer Mode" in the top-right, click "Load unpacked", and select the `extension/` directory from the repository folder. If you downloaded the packaged extension, unzip `extension.zip` first.',
    
    faq_q2: 'Why is the AI chat or notice explainer showing connection errors?',
    faq_a2: 'This happens if the backend server is not running or if there is a network block. If you are running the project locally, make sure you ran `npx tsx scripts/local-backend.ts` in your terminal. If you are accessing the production extension, check your internet connection or verify if your database credentials (DATABASE_URL) are configured correctly on Vercel.',
    
    faq_q3: 'Is my data private when using the extension?',
    faq_a3: 'Absolutely. Right to Stay NJ is designed with a privacy-first approach. All notice text analysis, logs, and simulated mediation chats are processed and stored locally in your browser\'s `localStorage`. We do not log names, address details, or upload lease documents to our servers.',
    
    faq_q4: 'How do I explain a text segment on a webpage?',
    faq_a4: 'Once installed, simply highlight any confusing lease clause, notice terms, or legal jargon on any webpage, right-click the highlighted text, and select "Explain with Right to Stay NJ" from the Chrome context menu. A detailed summary will appear in your extension pop-up.',

    // GitHub Card
    contact_title: 'Direct Support on GitHub',
    contact_desc: 'Right to Stay NJ is an open-source project. You can report bugs, submit feedback, or request features directly on our official GitHub repository. Our team reviews issues regularly.',
    btn_github_issue: 'Open a Support Ticket on GitHub',
    btn_github_repo: 'View GitHub Repository',
    github_tip: 'Note: To open an issue, you will need a free GitHub account.'
  },
  es: {
    eyebrow: 'Obtenga asistencia y reporte problemas',
    title: 'Centro de Soporte de la Extensión',
    desc: 'Si experimenta problemas con la extensión de Chrome de Right to Stay NJ, encuentre guías de solución de problemas a continuación o contáctenos directamente en GitHub.',
    
    // Status indicators
    status_title: 'Estado del Sistema',
    status_ai: 'API de Asistencia de IA',
    status_db: 'API de Análisis de Avisos',
    status_ext: 'Servicios de la Extensión de Navegador',
    status_online: 'En Línea',
    status_operational: 'Operativo',

    // FAQ Accordion
    faq_title: 'Preguntas Frecuentes',
    faq_q1: '¿Cómo instalo la extensión?',
    faq_a1: 'Para instalar la extensión durante las pruebas de desarrollo, abra Chrome y vaya a `chrome://extensions`. Active el "Modo de desarrollador" en la esquina superior derecha, haga clic en "Cargar descomprimida" y seleccione la carpeta `extension/` del directorio del repositorio. Si descargó la versión empaquetada, descomprima primero `extension.zip`.',
    
    faq_q2: '¿Por qué el chat de IA o el explicador de avisos muestran errores de conexión?',
    faq_a2: 'Esto ocurre si el servidor de backend no se está ejecutando o si hay un bloqueo de red. Si está ejecutando el proyecto localmente, asegúrese de haber ejecutado `npx tsx scripts/local-backend.ts` en su terminal. Si está usando la extensión en producción, verifique su conexión a internet o asegúrese de que las credenciales de la base de datos (DATABASE_URL) estén configuradas correctamente en Vercel.',
    
    faq_q3: '¿Mis datos están seguros al usar la extensión?',
    faq_a3: 'Totalmente. Right to Stay NJ está diseñado con un enfoque de privacidad primero. Todo el análisis de texto de avisos, registros y chats de mediación simulados se procesan y almacenan localmente en el `localStorage` de su navegador. No registramos nombres, direcciones ni subimos documentos de arrendamiento a nuestros servidores.',
    
    faq_q4: '¿Cómo explico un segmento de texto en una página web?',
    faq_a4: 'Una vez instalada, simplemente resalte cualquier cláusula de contrato confusa, términos de avisos o jerga legal en cualquier página web, haga clic derecho en el texto resaltado y seleccione "Explicar con Realidad de Alquiler" en el menú contextual de Chrome. Aparecerá un desglose detallado en el menú desplegable de su extensión.',

    // GitHub Card
    contact_title: 'Soporte Directo en GitHub',
    contact_desc: 'Right to Stay NJ es un proyecto de código abierto. Puede reportar errores, enviar comentarios o solicitar nuevas funciones directamente en nuestro repositorio oficial de GitHub. Nuestro equipo revisa los reportes regularmente.',
    btn_github_issue: 'Abrir un ticket de soporte en GitHub',
    btn_github_repo: 'Ver repositorio de GitHub',
    github_tip: 'Nota: Para abrir un reporte, necesitará una cuenta gratuita de GitHub.'
  }
}

export function Support() {
  const { lang } = useTranslation()
  const content = supportContent[lang === 'es' ? 'es' : 'en']
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <section className="shell page-section">
      <PageIntro eyebrow={content.eyebrow} title={content.title}>
        <p>{content.desc}</p>
      </PageIntro>

      <div className="grid gap-8 md:grid-cols-3 mt-8">
        
        {/* Main Content Area: FAQs */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-xl font-bold border-b border-rule pb-3 mb-4 flex items-center gap-2">
            ❓ {content.faq_title}
          </h2>
          
          <div className="space-y-4">
            {/* FAQ 1 */}
            <article className="border border-rule rounded-lg p-4 bg-paper/40 transition hover:bg-paper/80">
              <button 
                onClick={() => toggleFaq(1)}
                className="w-full text-left font-bold flex justify-between items-center cursor-pointer text-sm md:text-base text-ink"
              >
                <span>{content.faq_q1}</span>
                <span className="text-lg font-mono">{openFaq === 1 ? '−' : '+'}</span>
              </button>
              {openFaq === 1 && (
                <div className="mt-3 text-xs md:text-sm text-margin/90 leading-relaxed border-t border-rule/50 pt-3">
                  {content.faq_a1}
                </div>
              )}
            </article>

            {/* FAQ 2 */}
            <article className="border border-rule rounded-lg p-4 bg-paper/40 transition hover:bg-paper/80">
              <button 
                onClick={() => toggleFaq(2)}
                className="w-full text-left font-bold flex justify-between items-center cursor-pointer text-sm md:text-base text-ink"
              >
                <span>{content.faq_q2}</span>
                <span className="text-lg font-mono">{openFaq === 2 ? '−' : '+'}</span>
              </button>
              {openFaq === 2 && (
                <div className="mt-3 text-xs md:text-sm text-margin/90 leading-relaxed border-t border-rule/50 pt-3">
                  {content.faq_a2}
                </div>
              )}
            </article>

            {/* FAQ 3 */}
            <article className="border border-rule rounded-lg p-4 bg-paper/40 transition hover:bg-paper/80">
              <button 
                onClick={() => toggleFaq(3)}
                className="w-full text-left font-bold flex justify-between items-center cursor-pointer text-sm md:text-base text-ink"
              >
                <span>{content.faq_q3}</span>
                <span className="text-lg font-mono">{openFaq === 3 ? '−' : '+'}</span>
              </button>
              {openFaq === 3 && (
                <div className="mt-3 text-xs md:text-sm text-margin/90 leading-relaxed border-t border-rule/50 pt-3">
                  {content.faq_a3}
                </div>
              )}
            </article>

            {/* FAQ 4 */}
            <article className="border border-rule rounded-lg p-4 bg-paper/40 transition hover:bg-paper/80">
              <button 
                onClick={() => toggleFaq(4)}
                className="w-full text-left font-bold flex justify-between items-center cursor-pointer text-sm md:text-base text-ink"
              >
                <span>{content.faq_q4}</span>
                <span className="text-lg font-mono">{openFaq === 4 ? '−' : '+'}</span>
              </button>
              {openFaq === 4 && (
                <div className="mt-3 text-xs md:text-sm text-margin/90 leading-relaxed border-t border-rule/50 pt-3">
                  {content.faq_a4}
                </div>
              )}
            </article>
          </div>
        </div>

        {/* Sidebar Panel: System Status & GitHub CTA */}
        <div className="space-y-6">
          
          {/* Status Box */}
          <div className="border border-rule rounded-lg p-5 bg-paper/30">
            <h3 className="text-sm font-bold uppercase tracking-wider text-ink/75 border-b border-rule pb-2 mb-4">
              🟢 {content.status_title}
            </h3>
            <ul className="space-y-3 text-xs">
              <li className="flex justify-between items-center">
                <span className="text-margin">{content.status_ai}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold">{content.status_online}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-margin">{content.status_db}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold">{content.status_online}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-margin">{content.status_ext}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold">{content.status_operational}</span>
              </li>
            </ul>
          </div>

          {/* GitHub Contact Card */}
          <div className="border border-rule rounded-lg p-5 bg-ink text-paper shadow-md">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              🛠️ {content.contact_title}
            </h3>
            <p className="text-xs text-paper/80 leading-relaxed mb-6">
              {content.contact_desc}
            </p>
            
            <div className="space-y-3">
              <a 
                href="https://github.com/Iceman-Dann/Right-to-Stay-NJ/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-paper text-ink hover:bg-paper/90 active:scale-98 transition py-2.5 rounded font-bold text-xs"
              >
                🐱 {content.btn_github_issue}
              </a>
              <a 
                href="https://github.com/Iceman-Dann/Right-to-Stay-NJ"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center border border-paper/30 hover:border-paper hover:bg-paper/10 active:scale-98 transition py-2.5 rounded font-semibold text-xs"
              >
                {content.btn_github_repo}
              </a>
            </div>
            
            <span className="block text-[10px] text-paper/60 text-center mt-4 italic">
              {content.github_tip}
            </span>
          </div>

        </div>

      </div>
    </section>
  )
}
