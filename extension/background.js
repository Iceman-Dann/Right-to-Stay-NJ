// Background service worker — handles long-running Groq requests
// and context menu integration for Right to Stay NJ extension

chrome.runtime.onInstalled.addListener(() => {
  // Create right-click context menu to explain selected text
  chrome.contextMenus.create({
    id: 'explain-selected',
    title: 'Explain with Right to Stay NJ',
    contexts: ['selection']
  })
})

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'explain-selected' && info.selectionText) {
    // Store selected text and open popup
    await chrome.storage.local.set({
      pendingNoticeText: info.selectionText
    })
    chrome.action.openPopup()
  }
})
