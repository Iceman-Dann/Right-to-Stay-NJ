import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { LanguageProvider, Layout } from './components'
import { About, CourtPrep, FindHelp, Home, KnowRights, UnderstandNotice } from './pages'
import { Impact } from './routes/Impact'
import { PrepareAnswer } from './routes/PrepareAnswer'
import { AiAssistant } from './routes/AiAssistant'
import { DraftLetters } from './routes/DraftLetters'
import { Support } from './routes/Support'
import { ExtensionPage } from './routes/ExtensionPage'

function RouteView() {
  const location = useLocation()
  
  useEffect(() => {
    window.scrollTo(0, 0)
    
    // Dynamic SEO Metadata Controller
    let title = 'NJ Tenant Eviction Help & Rights Assistant | Right to Stay NJ'
    let description = 'Facing eviction, illegal lockouts, or rent increases in NJ? Get instant local rent cap calculations, draft your legal Answer defense packets, and find free legal aid.'
    
    switch (location.pathname) {
      case '/':
        title = 'NJ Tenant Eviction Help & Rights Assistant | Right to Stay NJ'
        description = 'Facing eviction, illegal lockouts, or rent increases in NJ? Get instant local rent cap calculations, draft your legal Answer defense packets, and find free legal aid.'
        break
      case '/understand-your-notice':
        title = 'Understand Eviction Notices in New Jersey | Right to Stay NJ'
        description = 'Learn what a Notice to Cease, Notice to Quit, Summons, or Warrant of Removal means in NJ. Check rent increase caps.'
        break
      case '/find-help':
        title = 'Find Free Legal Aid & Courthouses in NJ | Right to Stay NJ'
        description = 'Browse local NJ county legal services offices and courthouses for free tenant defense assistance.'
        break
      case '/know-your-rights':
        title = 'Know Your NJ Tenant Rights | Right to Stay NJ'
        description = 'Essential guidelines on NJ eviction law, illegal lockouts, utility shutoffs, and security deposit regulations.'
        break
      case '/court-prep':
        title = 'NJ Landlord-Tenant Court Mediation Practice | Right to Stay NJ'
        description = 'Simulate a court mediation session with an AI attorney. Practice avoiding Consent to Judgment traps.'
        break
      case '/text-help':
        title = 'Get Eviction Help by Text Message in NJ | Right to Stay NJ'
        description = 'Try our private, rules-first text messaging assistant preview for instant plain-language eviction notice explanations.'
        break
      case '/prepare-answer':
        title = 'Draft Eviction Defense Answer Packet | Right to Stay NJ'
        description = 'Use our ledger calculator and AI legal defense auditor to prepare a print-ready defense packet for NJ Special Civil Part court.'
        break
      case '/draft-letters':
        title = 'Draft Landlord Letters & Notices | Right to Stay NJ'
        description = 'Generate print-ready Notices of Habitability Deficiencies and Harassment Cease & Desist letters for your landlord under NJ tenant laws.'
        break
      case '/impact':
        title = 'Public Interest Activity Dashboard | Right to Stay NJ'
        description = 'See how tenants across New Jersey are using Right to Stay NJ to research rights, lockouts, and municipal caps.'
        break
      case '/about':
        title = 'About the Right to Stay NJ Project | Right to Stay NJ'
        description = 'An independent housing portal created to help NJ tenants understand official eviction summonses and connect with legal aid counsel.'
        break
      case '/support':
        title = 'Extension Support & Troubleshooting | Right to Stay NJ'
        description = 'Need help with the Right to Stay NJ Chrome extension? Access our FAQ database or open a support ticket on GitHub.'
        break
      case '/extension':
        title = 'Chrome Extension | Right to Stay NJ — Tenant Rights in Your Browser'
        description = 'Install the free Right to Stay NJ Chrome extension. Decode eviction notices, chat with an AI rights assistant, and get legal guidance on any webpage.'
        break
      case '/ai-assistant':
        title = 'Ask Llama 3.1 Tenant Q&A Rights Assistant | Right to Stay NJ'
        description = 'Get instant answers to NJ tenant questions, calculate caps, and build custom checklists with our AI rights assistant.'
        break
    }
    
    // Inject metadata
    document.title = title
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute('content', description)
    }
  }, [location.pathname])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/understand-your-notice" element={<UnderstandNotice />} />
        <Route path="/find-help" element={<FindHelp />} />
        <Route path="/know-your-rights" element={<KnowRights />} />
        <Route path="/court-prep" element={<CourtPrep />} />
        <Route path="/prepare-answer" element={<PrepareAnswer />} />
        <Route path="/draft-letters" element={<DraftLetters />} />
        <Route path="/impact" element={<Impact />} />
        <Route path="/about" element={<About />} />
        <Route path="/support" element={<Support />} />
        <Route path="/extension" element={<ExtensionPage />} />
        <Route path="/ai-assistant" element={<AiAssistant />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <RouteView />
      </BrowserRouter>
    </LanguageProvider>
  )
}
