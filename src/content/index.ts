// Content Script - floating button saat user menyeleksi teks

let floatingBtn: HTMLButtonElement | null = null

document.addEventListener('mouseup', () => {
  const selection = window.getSelection()
  const text = selection?.toString().trim()

  if (text && text.length > 10) {
    showFloatingButton(selection!)
  } else {
    removeFloatingButton()
  }
})

document.addEventListener('mousedown', (e) => {
  if (floatingBtn && !floatingBtn.contains(e.target as Node)) {
    removeFloatingButton()
  }
})

function showFloatingButton(selection: Selection) {
  removeFloatingButton()

  const range = selection.getRangeAt(0)
  const rect = range.getBoundingClientRect()

  floatingBtn = document.createElement('button')
  floatingBtn.textContent = '✨ MediCode'
  floatingBtn.style.cssText = `
    position: fixed;
    top: ${rect.top + window.scrollY - 36}px;
    left: ${rect.left + window.scrollX}px;
    z-index: 999999;
    background: #2563EB;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 4px 10px;
    font-size: 12px;
    font-family: Inter, sans-serif;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  `

  floatingBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'OPEN_POPUP' })
    removeFloatingButton()
  })

  document.body.appendChild(floatingBtn)
}

function removeFloatingButton() {
  floatingBtn?.remove()
  floatingBtn = null
}
