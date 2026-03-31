// Service Worker — AI hanya untuk smart search, kalkulasi tarif lokal

export type AIProvider = 'gemini-flash' | 'groq' | 'openrouter'

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  // ICD-9 search via NLM (tanpa AI)
  if (message.type === 'ICD9_SEARCH') {
    searchICD9NLM(message.query)
      .then(sendResponse)
      .catch((err) => sendResponse({ error: err.message }))
    return true
  }

  // AI: expand query medis informal → istilah ICD resmi
  if (message.type === 'AI_EXPAND') {
    expandMedicalQuery(message.query, message.searchType)
      .then(sendResponse)
      .catch((err) => sendResponse({ error: err.message }))
    return true
  }

  // Validasi API key
  if (message.type === 'AI_VALIDATE') {
    validateKey(message.apiKey)
      .then(() => sendResponse({}))
      .catch((err) => sendResponse({ error: err.message }))
    return true
  }
})

// ── NLM ICD-9-CM Procedure Search ────────────────────────────
// Endpoint: icd9cm_sg (surgical/procedure), bukan icd9cm_dx (diagnosis)
async function searchICD9NLM(query: string): Promise<{ results: { code: string; desc: string }[] }> {
  // Normalisasi kode: "9357" → "93.57", "9357" → coba keduanya
  const normalized = query.replace(/^(\d{2})(\d+)$/, '$1.$2')
  const searchTerm = normalized !== query ? normalized : query

  const url = `https://clinicaltables.nlm.nih.gov/api/icd9cm_sg/v3/search?sf=code,code_dotted,long_name&terms=${encodeURIComponent(searchTerm)}&maxList=7&df=code_dotted,long_name`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`NLM error: ${res.status}`)
  const data = await res.json() as [number, string[], null, [string, string][]]
  const items = data[3] ?? []
  return { results: items.map(([code, desc]) => ({ code, desc })) }
}

// ── AI: Smart Query Expander ──────────────────────────────────
// Mengubah istilah informal/singkatan → istilah medis resmi untuk dicari di ICD
async function expandMedicalQuery(query: string, searchType: 'icd10' | 'icd9'): Promise<{ terms: string[] }> {
  const { apiKey, aiProvider } = await chrome.storage.local.get(['apiKey', 'aiProvider'])
  if (!apiKey) return { terms: [query] } // fallback tanpa AI

  const standard = searchType === 'icd10' ? 'ICD-10' : 'ICD-9-CM'
  const prompt = `Kamu adalah asisten koding medis Indonesia. Ubah istilah medis informal berikut menjadi 3-5 istilah medis resmi dalam Bahasa Indonesia dan Inggris yang cocok untuk dicari di database ${standard}.

Input: "${query}"

Contoh:
- "dm2" → ["diabetes melitus tipe 2", "type 2 diabetes mellitus", "diabetes tipe 2"]
- "hipertensi" → ["hipertensi esensial", "essential hypertension", "tekanan darah tinggi"]
- "usus buntu" → ["appendicitis", "radang usus buntu", "acute appendicitis"]

Kembalikan HANYA JSON array string, tanpa markdown:
["istilah1", "istilah2", "istilah3"]`

  try {
    const raw = await callAI(apiKey, aiProvider ?? 'gemini-flash', prompt)
    const cleaned = raw.replace(/```json|```/g, '').trim()
    const terms = JSON.parse(cleaned)
    return { terms: Array.isArray(terms) ? [query, ...terms] : [query] }
  } catch {
    return { terms: [query] }
  }
}

async function validateKey(apiKey: string): Promise<void> {
  const { aiProvider } = await chrome.storage.local.get('aiProvider')
  // aiProvider sudah disimpan sebelum validasi dipanggil dari Popup
  await callAI(apiKey, aiProvider ?? 'gemini-flash', 'Reply with the word: ok')
}

async function callAI(apiKey: string, provider: string, prompt: string): Promise<string> {
  switch (provider) {
    case 'groq': {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: prompt }], temperature: 0.1 }),
      })
      if (!res.ok) { const j = await res.json(); throw new Error(j.error?.message ?? `Groq ${res.status}`) }
      return (await res.json()).choices?.[0]?.message?.content ?? ''
    }
    case 'openrouter': {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`, 'HTTP-Referer': 'chrome-extension://medicode' },
        body: JSON.stringify({ model: 'mistralai/mistral-7b-instruct:free', messages: [{ role: 'user', content: prompt }], temperature: 0.1 }),
      })
      if (!res.ok) { const j = await res.json(); throw new Error(j.error?.message ?? `OpenRouter ${res.status}`) }
      return (await res.json()).choices?.[0]?.message?.content ?? ''
    }
    default: { // gemini-flash
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) }
      )
      if (!res.ok) { const j = await res.json(); throw new Error(j.error?.message ?? `Gemini ${res.status}`) }
      return (await res.json()).candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    }
  }
}
