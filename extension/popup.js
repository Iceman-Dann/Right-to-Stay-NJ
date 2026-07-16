// Right to Stay NJ — Chrome Extension Popup Script
// Calls the local serverless backend API which holds the Groq API key

let lang = 'en'
let chatHistory = []
let loading = false

const LABELS = {
  en: {
    welcome: '👋 Hi! I\'m your NJ tenant rights assistant. Ask me anything about eviction notices, your rights, or the court process.',
    chat_tab: 'Ask a Question',
    notice_tab: 'Explain My Notice',
    chat_placeholder: 'Ask about your rights...',
    notice_placeholder: 'Paste the text from your eviction notice here...',
    explain_btn: '🔍 Explain Pasted Text',
    analyze_btn: '🔍 Analyze Current Page',
    send_btn: 'Send',
    disc_strong: 'General info, not legal advice.',
    disc_text: ' Call LSNJLAW free: <strong><a href="tel:18885765529" style="color:#92400e">1-888-576-5529</a></strong>',
    footer_disc: 'Not legal advice • NJ law only',
    footer_link: 'Open Full App →',
  },
  es: {
    welcome: '👋 ¡Hola! Soy su asistente de derechos de inquilinos en NJ. Pregúnteme sobre avisos de desalojo, sus derechos o el proceso judicial.',
    chat_tab: 'Hacer una pregunta',
    notice_tab: 'Explicar mi aviso',
    chat_placeholder: 'Pregunte sobre sus derechos...',
    notice_placeholder: 'Pegue el texto de su aviso de desalojo aquí...',
    explain_btn: '🔍 Explicar texto pegado',
    analyze_btn: '🔍 Analizar página actual',
    send_btn: 'Enviar',
    disc_strong: 'Información general, no asesoramiento legal.',
    disc_text: ' Llame a LSNJLAW gratis: <strong><a href="tel:18885765529" style="color:#92400e">1-888-576-5529</a></strong>',
    footer_disc: 'No es asesoramiento legal • Solo ley de NJ',
    footer_link: 'Abrir app completa →',
  }
}

// Mid-2026 Legal Aid & Courthouse Directory
const legalAidOffices = [
  { county: 'Bergen', organization: 'Northeast NJ Legal Services', phone: '201-487-2166', address: '190 Moore St, Suite 100, Hackensack, NJ 07601' },
  { county: 'Hudson', organization: 'Northeast NJ Legal Services', phone: '201-792-6363', address: '574 Summit Ave, 2nd Floor, Jersey City, NJ 07306' },
  { county: 'Essex', organization: 'Essex County Legal Aid Association', phone: '973-624-4500', address: '5 Commerce St, 2nd Floor, Newark, NJ 07102' },
  { county: 'Union', organization: 'Legal Services of New Jersey', phone: '908-354-4340', address: '60 Prince St, Elizabeth, NJ 07208' },
  { county: 'Middlesex', organization: 'Central Jersey Legal Services', phone: '732-249-7600', address: '317 George St, Suite 201, New Brunswick, NJ 08901' },
  { county: 'Mercer', organization: 'Central Jersey Legal Services', phone: '609-695-6249', address: '198 West State St, Trenton, NJ 08608' },
  { county: 'Monmouth', organization: 'Legal Services of New Jersey', phone: '732-414-6750', address: '303 West Main St, 3rd Floor, Freehold, NJ 07728' },
  { county: 'Ocean', organization: 'Legal Services of New Jersey', phone: '732-608-7794', address: '215 Main St, Toms River, NJ 08753' },
  { county: 'Camden', organization: 'South Jersey Legal Services', phone: '856-964-2010', address: '745 Market St, Camden, NJ 08102' },
  { county: 'Burlington', organization: 'South Jersey Legal Services', phone: '609-261-1088', address: '107 High St, Mount Holly, NJ 08060' },
  { county: 'Gloucester', organization: 'South Jersey Legal Services', phone: '856-848-5360', address: '47 Newton Ave, Woodbury, NJ 08096' },
  { county: 'Passaic', organization: 'Northeast NJ Legal Services', phone: '973-977-4150', address: '66 Hamilton St, 3rd Floor, Paterson, NJ 07505' },
]

function setLang(newLang) {
  lang = newLang
  document.getElementById('btn-en').classList.toggle('active', lang === 'en')
  document.getElementById('btn-es').classList.toggle('active', lang === 'es')
  applyLabels()
  chrome.storage.local.set({ lang })
}

function applyLabels() {
  const L = LABELS[lang]
  document.getElementById('chat-tab-label').textContent = L.chat_tab
  document.getElementById('notice-tab-label').textContent = L.notice_tab
  document.getElementById('chat-input').placeholder = L.chat_placeholder
  document.getElementById('notice-text').placeholder = L.notice_placeholder
  document.getElementById('btn-explain').innerHTML = L.explain_btn
  document.getElementById('btn-analyze-page').innerHTML = L.analyze_btn
  document.getElementById('btn-send').textContent = L.send_btn
  document.getElementById('disc-strong').textContent = L.disc_strong
  document.getElementById('disc-text').innerHTML = L.disc_text
  document.getElementById('footer-disc').textContent = L.footer_disc
  document.getElementById('footer-link').textContent = L.footer_link

  const welcomeMsg = document.getElementById('welcome-msg')
  if (welcomeMsg) welcomeMsg.innerHTML = '👋 ' + L.welcome
}

async function init() {
  // Load persistent local state
  const data = await chrome.storage.local.get([
    'lang',
    'pendingNoticeText',
    'noticeText',
    'noticeResultHtml',
    'selectedCounty',
    'chatHistory',
    'checklistItems'
  ])

  lang = data.lang || 'en'
  document.getElementById('btn-en').classList.toggle('active', lang === 'en')
  document.getElementById('btn-es').classList.toggle('active', lang === 'es')
  applyLabels()

  // Always show chat-panel directly since key is handled by the backend
  document.getElementById('chat-panel').classList.remove('hidden')

  // Restore notice text and result
  if (data.noticeText) {
    document.getElementById('notice-text').value = data.noticeText
  }
  if (data.noticeResultHtml) {
    const resultEl = document.getElementById('notice-result')
    resultEl.innerHTML = data.noticeResultHtml
    resultEl.classList.remove('hidden')
    document.getElementById('result-actions').classList.remove('hidden')
  }

  // Restore county selector
  if (data.selectedCounty) {
    document.getElementById('county-selector').value = data.selectedCounty
    handleCountyChange({ target: { value: data.selectedCounty } })
  }

  // Restore chat history
  if (data.chatHistory && data.chatHistory.length > 0) {
    chatHistory = data.chatHistory
    const messagesContainer = document.getElementById('chat-messages')
    messagesContainer.innerHTML = '' // Clear default welcome
    
    chatHistory.forEach(msg => {
      const div = document.createElement('div')
      div.className = `chat-bubble ${msg.role}`
      if (msg.role === 'assistant') {
        div.innerHTML = formatMessageToHtml(msg.content)
      } else {
        div.innerHTML = escapeHtml(msg.content)
      }
      messagesContainer.appendChild(div)
    })
    messagesContainer.scrollTop = messagesContainer.scrollHeight
  }

  // Restore checklist items state
  if (data.checklistItems && data.checklistItems.length > 0) {
    const container = document.getElementById('checklist-items-container')
    container.innerHTML = '' // Clear standard defaults
    
    data.checklistItems.forEach(item => {
      const itemDiv = document.createElement('div')
      itemDiv.style.cssText = 'display: flex; gap: 8px; align-items: flex-start; background: white; padding: 10px; border: 1.5px solid var(--color-rule); border-radius: 8px; font-size: 12px; line-height: 1.4;'
      itemDiv.innerHTML = `
        <input type="checkbox" id="${item.id}" ${item.checked ? 'checked' : ''} style="margin-top: 2.5px; cursor: pointer; accent-color: var(--color-margin);" />
        <label for="${item.id}" style="flex:1; cursor: pointer; color: var(--color-ink);">${item.text}</label>
      `
      container.appendChild(itemDiv)
    })
  }

  // Check if context menu sent a pending notice text to explain
  if (data.pendingNoticeText) {
    switchTab('notice')
    document.getElementById('notice-text').value = data.pendingNoticeText
    chrome.storage.local.remove(['pendingNoticeText'])
    explainNotice()
  }
}

function switchTab(tab) {
  const tabs = ['chat', 'notice', 'checklist']
  tabs.forEach(t => {
    const el = document.getElementById(`${t}-tab`)
    const btn = document.getElementById(`tab-${t}-btn`)
    if (el) el.classList.toggle('hidden', t !== tab)
    if (btn) btn.classList.toggle('active', t === tab)
  })
}

async function fetchFromUrl(url, message, historyList) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: message,
      history: historyList.map(h => ({ role: h.role, content: h.content })),
      lang: lang
    })
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Server error: ${err}`)
  }

  const json = await res.json()
  return json.reply || ''
}

async function callBackend(message, historyList) {
  // Call the production Vercel API endpoint
  return await fetchFromUrl('https://righttostaynj.org/api/ai-chat', message, historyList)
}

function addBubble(role, text, isLoading = false) {
  const container = document.getElementById('chat-messages')
  const div = document.createElement('div')
  div.className = `chat-bubble ${role}`
  if (isLoading) {
    div.className += ' loading'
    div.id = 'loading-bubble'
    div.innerHTML = '<div class="dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>'
  } else {
    div.innerHTML = formatMessageToHtml(text)
  }
  container.appendChild(div)
  container.scrollTop = container.scrollHeight
  return div
}

async function sendChat() {
  if (loading) return
  const input = document.getElementById('chat-input')
  const text = input.value.trim()
  if (!text) return

  input.value = ''
  loading = true
  document.getElementById('btn-send').disabled = true
  
  const userMsg = { role: 'user', content: text }
  addBubble('user', text)
  const loadingEl = addBubble('assistant', '', true)

  try {
    const reply = await callBackend(text, chatHistory)
    chatHistory.push(userMsg)
    chatHistory.push({ role: 'assistant', content: reply })
    
    // Save updated chat history locally
    chrome.storage.local.set({ chatHistory })

    loadingEl.remove()
    addBubble('assistant', reply)
    
    // Parse any action items from chat and add to checklist
    updateChecklistFromText(reply)
  } catch (err) {
    loadingEl.remove()
    addBubble('assistant', `⚠️ Error connecting to the server: ${err.message || err}`)
  } finally {
    loading = false
    document.getElementById('btn-send').disabled = false
    input.focus()
  }
}

async function explainNotice() {
  if (loading) return
  const noticeText = document.getElementById('notice-text').value.trim()
  if (!noticeText) return

  loading = true
  document.getElementById('btn-explain').disabled = true
  document.getElementById('btn-explain').innerHTML = '⏳ Analyzing...'
  document.getElementById('result-actions').classList.add('hidden')

  const resultEl = document.getElementById('notice-result')
  resultEl.classList.remove('hidden')
  resultEl.innerHTML = '<div class="dots" style="padding:4px"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>'

  try {
    const prompt = lang === 'es'
      ? `Por favor explica este aviso de desalojo de NJ en términos simples y claros:\n\n${noticeText}`
      : `Please explain this NJ eviction notice in clear, simple terms:\n\n${noticeText}`

    const reply = await callBackend(prompt, [])
    resultEl.innerHTML = formatMessageToHtml(reply)
    document.getElementById('result-actions').classList.remove('hidden')
    
    // Save results and inputs locally
    chrome.storage.local.set({
      noticeText,
      noticeResultHtml: resultEl.innerHTML
    })

    // Parse checklist items
    updateChecklistFromText(reply)

    // Auto-scroll notice tab to reveal result
    setTimeout(() => {
      document.getElementById('notice-tab').scrollTop = resultEl.offsetTop - 20
    }, 100)
  } catch (err) {
    resultEl.innerHTML = `<span style="color:#dc2626">⚠️ Could not analyze notice: ${err.message || err}.</span>`
  } finally {
    loading = false
    document.getElementById('btn-explain').disabled = false
    document.getElementById('btn-explain').innerHTML = LABELS[lang].explain_btn
  }
}

async function analyzeCurrentPage() {
  if (loading) return
  
  loading = true
  const btn = document.getElementById('btn-analyze-page')
  btn.disabled = true
  btn.innerHTML = '⏳ Reading Page...'
  document.getElementById('result-actions').classList.add('hidden')
  
  const resultEl = document.getElementById('notice-result')
  resultEl.classList.remove('hidden')
  resultEl.innerHTML = '<div class="dots" style="padding:4px"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>'
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab) throw new Error('No active tab found')
    
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => document.body.innerText
    })
    
    if (!result || !result.trim()) {
      throw new Error('No readable text found on the active webpage.')
    }
    
    btn.innerHTML = '⏳ Analyzing...'
    
    const prompt = lang === 'es'
      ? `Por favor analiza el contenido de esta página web o documento de desalojo de NJ y explícalo en términos simples:\n\n${result.slice(0, 4000)}`
      : `Please analyze the text of this webpage or eviction document and explain it under NJ landlord-tenant law in simple terms:\n\n${result.slice(0, 4000)}`
      
    const reply = await callBackend(prompt, [])
    resultEl.innerHTML = formatMessageToHtml(reply)
    document.getElementById('result-actions').classList.remove('hidden')
    
    // Save results and extracted text locally
    chrome.storage.local.set({
      noticeText: result.slice(0, 4000),
      noticeResultHtml: resultEl.innerHTML
    })

    // Parse checklist items
    updateChecklistFromText(reply)

    // Auto-scroll notice tab to reveal result
    setTimeout(() => {
      document.getElementById('notice-tab').scrollTop = resultEl.offsetTop - 20
    }, 100)
  } catch (err) {
    console.error(err)
    resultEl.innerHTML = `<span style="color:#dc2626">⚠️ Could not analyze webpage. (${err.message || ''})</span>`
  } finally {
    loading = false
    btn.disabled = false
    btn.innerHTML = LABELS[lang].analyze_btn
  }
}

// Copy result to clipboard
async function copyResult() {
  const resultEl = document.getElementById('notice-result')
  const btn = document.getElementById('btn-copy')
  try {
    await navigator.clipboard.writeText(resultEl.innerText)
    const oldText = btn.innerText
    btn.innerText = '✅ Copied!'
    setTimeout(() => { btn.innerText = oldText }, 2000)
  } catch (e) {
    console.error('Failed to copy', e)
  }
}

// Print analysis result (opens clean print layout)
function printResult() {
  const resultEl = document.getElementById('notice-result')
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  printWindow.document.write(`
    <html>
      <head>
        <title>Right to Stay NJ — Eviction Notice Analysis</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 40px;
            color: #1c2b3a;
            max-width: 800px;
            margin: 0 auto;
            line-height: 1.6;
          }
          h1 {
            font-size: 20px;
            border-bottom: 2px solid #3d6b52;
            padding-bottom: 8px;
            color: #1c2b3a;
            text-transform: uppercase;
            letter-spacing: -0.01em;
          }
          h2, h3, h4 { color: #1c2b3a; margin-top: 20px; }
          p { margin-bottom: 12px; font-size: 14px; }
          li { font-size: 14px; margin-bottom: 6px; }
          .footer {
            margin-top: 40px;
            border-top: 1px solid #cbd5e1;
            padding-top: 12px;
            font-size: 11px;
            color: #64748b;
          }
          .disclaimer {
            background: #fef3c7;
            border: 1px solid #fde68a;
            padding: 12px;
            border-radius: 6px;
            font-size: 12px;
            margin-bottom: 20px;
            color: #92400e;
          }
        </style>
      </head>
      <body>
        <h1>Eviction Notice Analysis</h1>
        <div class="disclaimer">
          <strong>Important Disclaimer:</strong> This document contains automated analysis of an eviction notice for general informational purposes under New Jersey law. This is NOT official legal advice. For official counsel, contact LSNJLAW at 1-888-576-5529.
        </div>
        <div>${resultEl.innerHTML}</div>
        <div class="footer">
          Generated by Right to Stay NJ — Tenant Support Directory (http://localhost:5173)
        </div>
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
    </html>
  `)
  printWindow.document.close()
}

// Dynamic Action Checklist builder
function updateChecklistFromText(text) {
  const container = document.getElementById('checklist-items-container')
  const lines = text.split('\n')
  
  const actionWords = ['file', 'call', 'contact', 'gather', 'prepare', 'deposit', 'submit', 'photograph', 'document', 'negotiate', 'reach', 'pay', 'consult', 'go', 'write', 'report']
  let taskCount = 0

  lines.forEach((line, index) => {
    const trimmed = line.trim()
    
    // Check list formats
    const isList = trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ') || trimmed.match(/^\d+\.\s/)
    if (!isList) return
    
    const cleanText = trimmed.replace(/^([-•*]|\d+\.)\s+/, '').trim()
    if (cleanText.length < 15 || cleanText.length > 200) return
    
    const words = cleanText.toLowerCase().split(/\s+/)
    const hasAction = words.some(w => actionWords.includes(w))
    
    if (hasAction) {
      taskCount++
      const chkId = `chk-dynamic-${index}`
      
      const itemDiv = document.createElement('div')
      itemDiv.style.cssText = 'display: flex; gap: 8px; align-items: flex-start; background: white; padding: 10px; border: 1.5px solid var(--color-rule); border-radius: 8px; font-size: 12px; line-height: 1.4; animation: fadeIn 0.3s;'
      
      itemDiv.innerHTML = `
        <input type="checkbox" id="${chkId}" style="margin-top: 2.5px; cursor: pointer; accent-color: var(--color-margin);" />
        <label for="${chkId}" style="flex:1; cursor: pointer; color: var(--color-ink);">${escapeHtml(cleanText)}</label>
      `
      container.appendChild(itemDiv)
    }
  })

  // Save the complete checklist state
  saveChecklistState()

  // If new items were loaded, notify user by switching tab button styling briefly
  if (taskCount > 0) {
    const tabBtn = document.getElementById('tab-checklist-btn')
    tabBtn.style.color = 'var(--color-margin)'
    tabBtn.style.fontWeight = '800'
    setTimeout(() => {
      tabBtn.style.color = ''
      tabBtn.style.fontWeight = ''
    }, 3000)
  }
}

// Save checklist state to local storage
function saveChecklistState() {
  const items = []
  const checkboxes = document.querySelectorAll('#checklist-items-container input[type="checkbox"]')
  checkboxes.forEach(chk => {
    const label = document.querySelector(`label[for="${chk.id}"]`)
    items.push({
      id: chk.id,
      text: label ? label.innerHTML : '',
      checked: chk.checked
    })
  })
  chrome.storage.local.set({ checklistItems: items })
}

// Courthouse Location finder
function handleCountyChange(e) {
  const val = e.target.value
  const infoEl = document.getElementById('county-court-info')
  const orgEl = document.getElementById('court-org')
  const addrEl = document.getElementById('court-address')
  const phoneEl = document.getElementById('court-phone')

  if (!val) {
    infoEl.classList.add('hidden')
    chrome.storage.local.remove(['selectedCounty'])
    return
  }

  const office = legalAidOffices.find(o => o.county === val)
  if (office) {
    orgEl.innerText = `${office.county} County: ${office.organization}`
    addrEl.innerText = office.address
    phoneEl.innerText = office.phone
    phoneEl.href = `tel:${office.phone.replace(/-/g, '')}`
    infoEl.classList.remove('hidden')
    chrome.storage.local.set({ selectedCounty: val })
  }
}

// Reset all local extension state
async function resetExtension() {
  const confirmClear = confirm(lang === 'es' 
    ? '¿Está seguro de que desea restablecer la extensión? Se borrará todo el historial local.'
    : 'Are you sure you want to reset the extension? This will clear all local history.'
  )
  if (confirmClear) {
    await chrome.storage.local.clear()
    window.location.reload()
  }
}

// Attach event listeners programmatically to bypass Chrome Extension CSP rules
document.addEventListener('DOMContentLoaded', () => {
  // Lang switchers
  document.getElementById('btn-en').addEventListener('click', () => setLang('en'))
  document.getElementById('btn-es').addEventListener('click', () => setLang('es'))

  // Tabs
  document.getElementById('tab-chat-btn').addEventListener('click', () => switchTab('chat'))
  document.getElementById('tab-notice-btn').addEventListener('click', () => switchTab('notice'))
  document.getElementById('tab-checklist-btn').addEventListener('click', () => switchTab('checklist'))

  // Interactive buttons
  document.getElementById('btn-send').addEventListener('click', sendChat)
  document.getElementById('btn-explain').addEventListener('click', explainNotice)
  document.getElementById('btn-analyze-page').addEventListener('click', analyzeCurrentPage)
  document.getElementById('btn-copy').addEventListener('click', copyResult)
  document.getElementById('btn-print').addEventListener('click', printResult)
  
  // Reset Data button
  document.getElementById('btn-reset').addEventListener('click', resetExtension)

  // County Selector
  document.getElementById('county-selector').addEventListener('change', handleCountyChange)

  // Listen for checkbox changes dynamically to save their checked states locally
  document.getElementById('checklist-items-container').addEventListener('change', (e) => {
    if (e.target && e.target.type === 'checkbox') {
      saveChecklistState()
    }
  })

  // Listen to typing in notice text to save draft state locally
  document.getElementById('notice-text').addEventListener('input', (e) => {
    chrome.storage.local.set({ noticeText: e.target.value })
  })

  // Keyboard support: Enter key submits prompt
  document.getElementById('chat-input').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendChat()
    }
  })

  init()
})

function formatMessageToHtml(content) {
  const lines = content.split('\n')
  let html = ''
  
  lines.forEach(line => {
    const trimmed = line.trim()
    if (!trimmed) {
      html += '<div style="height:6px"></div>'
      return
    }
    
    // Headers
    if (trimmed.startsWith('### ')) {
      html += `<h4 style="font-weight:750; font-size:13.5px; color:var(--color-ink); margin-top:12px; margin-bottom:4px; text-transform:uppercase; letter-spacing:0.02em;">${formatInlineHtml(trimmed.slice(4))}</h4>`
      return
    }
    if (trimmed.startsWith('## ')) {
      html += `<h3 style="font-weight:750; font-size:14.5px; color:var(--color-ink); margin-top:14px; margin-bottom:6px;">${formatInlineHtml(trimmed.slice(3))}</h3>`
      return
    }
    if (trimmed.startsWith('# ')) {
      html += `<h2 style="font-weight:800; font-size:16px; color:var(--color-ink); margin-top:16px; margin-bottom:8px;">${formatInlineHtml(trimmed.slice(2))}</h2>`
      return
    }
    
    // Unordered Lists (Supports -, •, and * bullet points)
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
      html += `<li style="margin-left:16px; list-style-type:disc; font-size:12.5px; margin-bottom:4px; line-height:1.5;">${formatInlineHtml(trimmed.slice(2))}</li>`
      return
    }
    
    // Ordered Lists
    const numMatch = trimmed.match(/^(\d+)\.\s(.*)/)
    if (numMatch) {
      html += `<div style="display:flex; gap:6px; font-size:12.5px; margin-bottom:4px; margin-left:6px; line-height:1.5;">
        <span style="font-weight:700; color:var(--color-margin);">${numMatch[1]}.</span>
        <div style="flex:1;">${formatInlineHtml(numMatch[2])}</div>
      </div>`
      return
    }
    
    // Standard text paragraph
    html += `<p style="margin-bottom:6px; line-height:1.55; font-size:13px;">${formatInlineHtml(line)}</p>`
  })
  
  return html
}

function formatInlineHtml(content) {
  // Regex to split: LaTeX block, LaTeX inline, Bold, Italic
  const regex = /(\\\[[\s\S]*?\\\]|\\\(.*?\\\)|(?:\*\*.*?\*\*)|(?:\*.*?\*))/g
  const parts = content.split(regex)
  
  let result = ''
  parts.forEach(part => {
    if (part.startsWith('\\[') && part.endsWith('\\]')) {
      const formula = part.slice(2, -2).trim()
      result += `<div style="margin:10px 0; padding:8px; background:rgba(23,36,58,0.04); border-left:3px solid var(--color-margin); border-radius:0 6px 6px 0; font-family:var(--font-mono); font-size:11.5px; text-align:center; overflow-x:auto;">${escapeHtml(formula)}</div>`
    } else if (part.startsWith('\\(') && part.endsWith('\\)')) {
      const formula = part.slice(2, -2).trim()
      result += `<span style="display:inline-block; padding:2px 5px; margin:0 2px; background:rgba(23,36,58,0.04); border-radius:4px; font-family:var(--font-mono); font-size:11.5px; color:var(--color-margin); font-weight:700;">${escapeHtml(formula)}</span>`
    } else if (part.startsWith('**') && part.endsWith('**')) {
      result += `<strong style="font-weight:700;">${part.slice(2, -2)}</strong>`
    } else if (part.startsWith('*') && part.endsWith('*')) {
      result += `<em style="font-style:italic;">${part.slice(1, -1)}</em>`
    } else {
      result += escapeHtml(part)
    }
  })
  return result
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
