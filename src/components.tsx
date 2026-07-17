import { NavLink, Link } from 'react-router-dom'
import { createContext, useContext, useState, ReactNode } from 'react'
import { translations } from './data/translations'
import { glossary } from './data/glossary'

export type Language = 'en' | 'es'
export type FontSize = 'normal' | 'large'

// --- SVG Icons ---
export function HomeIcon({ className = "w-6 h-6" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  )
}

export function DocumentIcon({ className = "w-6 h-6" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  )
}

export function MapIcon({ className = "w-6 h-6" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" />
    </svg>
  )
}

export function ScalesIcon({ className = "w-6 h-6" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 8.25h18M3 13.5h18M6 8.25l3 5.25m-3-5.25L3 13.5m15-5.25l3 5.25m-3-5.25l-3 5.25M6 13.5a3 3 0 100 6 3 3 0 000-6zm12 0a3 3 0 100 6 3 3 0 000-6z" />
    </svg>
  )
}

export function MenuIcon({ className = "w-6 h-6" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  )
}

export function ShieldIcon({ className = "w-5 h-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  )
}

export function PhoneIcon({ className = "w-4 h-4" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.387a12.035 12.035 0 01-7.108-7.108c-.145-.44.02-.927.387-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  )
}

export function DirectionsIcon({ className = "w-4 h-4" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75l6 6-6 6" />
    </svg>
  )
}

export function CopyIcon({ className = "w-4 h-4" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-3a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.875V18a2.25 2.25 0 002.25 2.25h5.25a2.25 2.25 0 002.25-2.25V7.875a2.25 2.25 0 00-2.25-2.25H9a2.25 2.25 0 00-2.25 2.25z" />
    </svg>
  )
}

export function CloseIcon({ className = "w-5 h-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

export function AlertIcon({ className = "w-5 h-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  )
}

export function SparkleIcon({ className = "w-5 h-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  )
}

export function LightbulbIcon({ className = "w-5 h-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925-3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18zm0 3h.008v-.008H12V21zm-3-3h6" />
    </svg>
  )
}

export function CourthouseIcon({ className = "w-5 h-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25L2.25 7.5v1.5h19.5V7.5L12 2.25zM4.5 9v9m3.75-9v9m3.75-9v9m3.75-9v9m3.75-9v9M2.25 19.5h19.5v2.25H2.25v-2.25z" />
    </svg>
  )
}

export function MediationIcon({ className = "w-5 h-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.08.302.125.62.125.949 0 2.22-2.35 4.02-5.25 4.02a5.556 5.556 0 01-1.08-.106l-2.42 1.614a.75.75 0 01-1.17-.622V13.5c-2.022-.843-3.3-2.485-3.3-4.34 0-2.485 2.686-4.5 6-4.5 3.314 0 6 2.015 6 4.5zM3.75 15.511c.08.302.125.62.125.949 0 2.22 2.35 4.02 5.25 4.02.37 0 .73-.037 1.08-.106l2.42 1.614a.75.75 0 001.17-.622V20.5c2.022-.843 3.3-2.485 3.3-4.34 0-2.485-2.686-4.5-6-4.5-3.314 0-6 2.015-6 4.5z" />
    </svg>
  )
}

export function MegaphoneIcon({ className = "w-5 h-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
  )
}

export function RefreshIcon({ className = "w-4 h-4" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  )
}

export function WarningIcon({ className = "w-5 h-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
}

export function TrashIcon({ className = "w-5 h-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  )
}

export function PlusIcon({ className = "w-5 h-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

export function PrintIcon({ className = "w-5 h-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0a2.25 2.25 0 01-2.244 2.077H8.584A2.25 2.25 0 016.34 18m11.32 0h-11.3m0 0V9a2.25 2.25 0 012.25-2.25h6.75a2.25 2.25 0 012.25 2.25v9M6.75 6.75V4.5a2.25 2.25 0 012.25-2.25h6a2.25 2.25 0 012.25 2.25v2.25m-10.5 6h10.5" />
    </svg>
  )
}

export function BackIcon({ className = "w-5 h-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  )
}

export function CheckIcon({ className = "w-5 h-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

export function GithubIcon({ className = "w-5 h-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className}>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  )
}

interface LanguageContextType {
  lang: Language
  setLang: (lang: Language) => void
  fontSize: FontSize
  setFontSize: (size: FontSize) => void
  t: (key: string) => string
}

export const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  fontSize: 'normal',
  setFontSize: () => {},
  t: (key) => key,
})

export function useTranslation() {
  return useContext(LanguageContext)
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('rts-lang')
    return (saved === 'es' || saved === 'en') ? saved : 'en'
  })

  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    const saved = localStorage.getItem('rts-fontsize')
    return (saved === 'large' || saved === 'normal') ? saved : 'normal'
  })

  function setLang(newLang: Language) {
    setLangState(newLang)
    localStorage.setItem('rts-lang', newLang)
  }

  function setFontSize(newSize: FontSize) {
    setFontSizeState(newSize)
    localStorage.setItem('rts-fontsize', newSize)
  }

  function t(key: string): string {
    const dict = translations[lang] || translations.en
    return (dict as any)[key] || key
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, fontSize, setFontSize, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function Annotation({ legalText, plainText }: { legalText: string; plainText: string }) {
  return <div className="annotation"><span className="legal-line font-notice">{legalText}</span><span className="plain-note">{plainText}</span></div>
}

export function GlossaryTerm({ termKey, children }: { termKey: string; children: ReactNode }) {
  const { lang } = useTranslation()
  const item = glossary[termKey]
  if (!item) return <>{children}</>

  return (
    <span className="glossary-term-wrapper group relative inline cursor-help border-b border-dashed border-margin/80">
      <span className="font-semibold text-margin/90 hover:text-margin">{children}</span>
      <span className="glossary-tooltip absolute bottom-full left-1/2 z-30 mb-2 w-64 -translate-x-1/2 rounded bg-ink text-paper p-3 text-xs leading-normal font-normal shadow-lg transition-all duration-150 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto">
        <strong className="block border-b border-paper/20 pb-1 mb-1 font-semibold">{item.term}</strong>
        {item.definition[lang] || item.definition.en}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-ink" />
      </span>
    </span>
  )
}

export function Layout({ children }: { children: ReactNode }) {
  const { lang, setLang, fontSize, setFontSize, t } = useTranslation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const AiIcon = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  )

  const nav = [
    [lang === 'es' ? 'Asistente IA' : 'AI Assistant', '/ai-assistant', <AiIcon className="w-5 h-5" />],
    [t('nav_understand'), '/understand-your-notice', <DocumentIcon className="w-5 h-5" />],
    [t('nav_find_help'), '/find-help', <MapIcon className="w-5 h-5" />],
    [t('nav_court_prep'), '/court-prep', <ScalesIcon className="w-5 h-5" />],
  ]

  const secondaryNav = [
    [t('nav_prepare_packet'), '/prepare-answer'],
    [t('nav_draft_letters'), '/draft-letters'],
    [t('nav_impact'), '/impact'],
    [lang === 'es' ? 'Extensión' : 'Extension', '/extension'],
    [lang === 'es' ? 'Soporte' : 'Support', '/support'],
    [t('nav_about'), '/about'],
  ]

  return (
    <div className={`min-h-screen bg-paper text-ink font-body transition-all duration-200 ${fontSize === 'large' ? 'accessibility-large-text' : ''}`}>
      <a className="skip-link" href="#main">Skip to main content</a>

      {/* Emergency Alert Banner */}
      <div className="emergency-lockout-banner" style={{background:'linear-gradient(90deg,#7f1d1d 0%,#991b1b 50%,#7f1d1d 100%)',color:'#FFF7F7',padding:'0.6rem 0',fontSize:'0.8rem',fontWeight:700,letterSpacing:'0.01em'}}>
        <div className="shell flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 leading-normal">
            <WarningIcon className="w-4 h-4 shrink-0" />
            <span>{t('emergency_banner_text')}</span>
          </span>
          <Link to="/know-your-rights" className="whitespace-nowrap font-bold ml-2 shrink-0 text-white hover:text-red-100 flex items-center gap-1" style={{borderBottom:'1px solid rgba(255,255,255,0.4)',paddingBottom:'1px'}}>
            {lang === 'es' ? 'Ver mis derechos' : 'See My Rights'} →
          </Link>
        </div>
      </div>

      <header className="border-b border-rule" style={{background:'rgba(247,245,239,0.95)',backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)',position:'sticky',top:0,zIndex:30}}>
        <div className="shell flex items-center justify-between gap-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight active:scale-97 transition">
            <img src="/icon.svg" className="h-7 w-7 object-contain" alt="" />
            <span>{t('home_title')}</span>
          </Link>
          
          {/* Desktop Navigation Top-Right preferences */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex rounded bg-rule/30 border border-rule p-0.5 text-xs">
              <button
                onClick={() => setFontSize('normal')}
                className={`px-2.5 py-0.5 rounded-sm font-medium transition cursor-pointer active:scale-95 ${fontSize === 'normal' ? 'bg-ink text-paper' : 'text-ink hover:bg-rule'}`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-2 py-0.5 rounded-sm font-bold transition cursor-pointer text-sm active:scale-95 ${fontSize === 'large' ? 'bg-ink text-paper' : 'text-ink hover:bg-rule'}`}
              >
                A+
              </button>
            </div>
            <div className="flex rounded bg-rule/30 border border-rule p-0.5 text-xs">
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-0.5 rounded-sm font-medium transition cursor-pointer active:scale-95 ${lang === 'en' ? 'bg-ink text-paper' : 'text-ink hover:bg-rule'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('es')}
                className={`px-2 py-0.5 rounded-sm font-medium transition cursor-pointer active:scale-95 ${lang === 'es' ? 'bg-ink text-paper' : 'text-ink hover:bg-rule'}`}
              >
                ES
              </button>
            </div>
            <a href="tel:18885765529" className="text-sm font-semibold text-margin hover:underline flex items-center gap-1 active:scale-95 transition">
              <PhoneIcon className="w-3.5 h-3.5" />
              {t('nav_hotline_label')}
            </a>
            <a 
              href="https://github.com/Iceman-Dann/Right-to-Stay-NJ" 
              target="_blank" 
              rel="noreferrer" 
              className="text-ink hover:text-margin active:scale-95 transition flex items-center ml-2"
              aria-label="GitHub Codebase"
            >
              <GithubIcon className="w-5.5 h-5.5" />
            </a>
          </div>
        </div>

        {/* Desktop Navigation Link row */}
        <nav aria-label="Main navigation" className="hidden md:flex shell gap-1 overflow-x-auto pb-4 text-sm whitespace-nowrap">
          {nav.map(([label, path]) => (
            <NavLink
              key={path as string}
              to={path as string}
              className={({ isActive }) => `px-3 py-1.5 rounded-lg font-semibold transition-colors ${ isActive ? 'bg-ink/8 text-margin' : 'text-ink/70 hover:text-ink hover:bg-ink/5'}`}
            >
              {label as string}
            </NavLink>
          ))}
          <span className="w-px bg-rule mx-1 self-stretch" />
          {secondaryNav.map(([label, path]) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `px-3 py-1.5 rounded-lg font-semibold transition-colors ${ isActive ? 'bg-ink/8 text-margin' : 'text-ink/60 hover:text-ink hover:bg-ink/5'}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      {/* Main Page Area */}
      <main id="main" className="pb-24 md:pb-0">{children}</main>

      <footer className="border-t border-rule hidden md:block">
        <div className="shell py-8 text-sm leading-6 flex flex-col md:flex-row justify-between items-center gap-4 text-margin/80">
          <p className="flex-1">{t('disclaimer_body')}</p>
          <a 
            href="https://github.com/Iceman-Dann/Right-to-Stay-NJ" 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center gap-1.5 font-bold text-ink hover:text-margin active:scale-95 transition border border-rule px-3.5 py-1.5 rounded-lg bg-paper"
          >
            <GithubIcon className="w-4.5 h-4.5 text-ink" />
            <span>GitHub Codebase</span>
          </a>
        </div>
      </footer>

      {/* --- Mobile UI Bottom Navigation Bar (Visible on mobile screens) --- */}
      <nav className="mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center px-2 pb-safe">
        <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl text-4xs font-bold transition-all active:scale-95 ${isActive ? 'text-margin bg-margin/8' : 'text-ink/50 hover:text-ink/80'}`}>
          <HomeIcon className="w-5.5 h-5.5" />
          <span>{lang === 'es' ? 'Inicio' : 'Home'}</span>
        </NavLink>
        {nav.map(([label, path, icon]) => (
          <NavLink key={path as string} to={path as string} className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl text-4xs font-bold transition-all active:scale-95 ${isActive ? 'text-margin bg-margin/8' : 'text-ink/50 hover:text-ink/80'}`}>
            {icon as ReactNode}
            <span>{label as string}</span>
          </NavLink>
        ))}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl text-4xs font-bold text-ink/50 transition-all active:scale-95 cursor-pointer hover:text-ink/80"
        >
          <MenuIcon className="w-5.5 h-5.5" />
          <span>{lang === 'es' ? 'Más' : 'More'}</span>
        </button>
      </nav>

      {/* --- Mobile "More" Drawer Slide-up bottom sheet --- */}
      <div className={`bottom-sheet-backdrop fixed inset-0 z-40 transition duration-200 md:hidden ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setDrawerOpen(false)} />
      <div className={`bottom-sheet-drawer fixed bottom-0 left-0 right-0 z-50 bg-paper rounded-t-2xl p-6 shadow-2xl transition-transform duration-300 transform md:hidden ${drawerOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        {/* Drag handle */}
        <div className="flex justify-center mb-5">
          <div style={{width:'2.5rem',height:'4px',borderRadius:'999px',background:'var(--color-rule)'}} />
        </div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-md font-bold uppercase tracking-wider text-ink">{lang === 'es' ? 'Herramientas Adicionales' : 'Additional Tools'}</h3>
          <button onClick={() => setDrawerOpen(false)} className="text-ink/60 hover:text-ink cursor-pointer active:scale-95 p-1 rounded-full bg-rule/20">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        
        {/* Drawer Links */}
        <div className="flex flex-col gap-4">
          {secondaryNav.map(([label, path]) => (
            <Link
              key={path}
              to={path}
              onClick={() => setDrawerOpen(false)}
              className="flex items-center justify-between p-3 border border-rule rounded-lg font-semibold hover:bg-rule/10 active:scale-98 transition text-sm text-ink"
            >
              <span>{label}</span>
              <DirectionsIcon className="w-4 h-4 text-margin" />
            </Link>
          ))}
        </div>

        {/* Preferences inside drawer */}
        <div className="mt-8 border-t border-rule pt-6 space-y-5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-margin/80 uppercase">{lang === 'es' ? 'Tamaño de Texto' : 'Text Size'}</span>
            <div className="flex rounded bg-rule/30 border border-rule p-0.5">
              <button
                onClick={() => setFontSize('normal')}
                className={`px-3 py-1 rounded-sm font-semibold active:scale-95 ${fontSize === 'normal' ? 'bg-ink text-paper' : 'text-ink'}`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-3 py-1 rounded-sm font-bold text-sm active:scale-95 ${fontSize === 'large' ? 'bg-ink text-paper' : 'text-ink'}`}
              >
                A+
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-margin/80 uppercase">{lang === 'es' ? 'Idioma' : 'Language'}</span>
            <div className="flex rounded bg-rule/30 border border-rule p-0.5">
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1 rounded-sm font-semibold active:scale-95 ${lang === 'en' ? 'bg-ink text-paper' : 'text-ink'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('es')}
                className={`px-3 py-1 rounded-sm font-semibold active:scale-95 ${lang === 'es' ? 'bg-ink text-paper' : 'text-ink'}`}
              >
                ES
              </button>
            </div>
          </div>
          <div className="pt-2 flex gap-3">
            <a href="tel:18885765529" className="flex-1 flex items-center justify-center gap-2 py-3 bg-margin text-paper rounded-lg font-bold text-sm active:scale-98 transition shadow-sm">
              <PhoneIcon className="w-4 h-4" />
              {t('nav_hotline')}
            </a>
            <a 
              href="https://github.com/Iceman-Dann/Right-to-Stay-NJ" 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center justify-center p-3 border border-rule rounded-lg hover:bg-rule/10 active:scale-95 transition"
              aria-label="GitHub Codebase"
            >
              <GithubIcon className="w-6 h-6 text-ink" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PageIntro({ eyebrow, title, children }: { eyebrow?: string; title: string; children: ReactNode }) {
  return <header className="max-w-3xl"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><div className="mt-5 max-w-2xl text-lg leading-8">{children}</div></header>
}

export function PrimaryLink({ to, children }: { to: string; children: ReactNode }) {
  return <Link to={to} className="primary-cta">{children}</Link>
}
