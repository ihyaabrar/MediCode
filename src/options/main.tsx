import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import '../popup/index.css'

const PROVIDERS = [
  { id: 'gemini-flash', label: 'Gemini Flash', placeholder: 'AIza...', link: 'https://aistudio.google.com/app/apikey' },
  { id: 'groq',         label: 'Groq',         placeholder: 'gsk_...',  link: 'https://console.groq.com/keys' },
  { id: 'openrouter',   label: 'OpenRouter',   placeholder: 'sk-or-...', link: 'https://openrouter.ai/keys' },
] as const
type ProviderId = typeof PROVIDERS[number]['id']

const Options: React.FC = () => {
  const [provider, setProvider] = useState<ProviderId>('gemini-flash')
  const [apiKey, setApiKey] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    chrome.storage.local.get(['apiKey', 'aiProvider'], ({ apiKey, aiProvider }) => {
      if (apiKey) setApiKey(apiKey)
      if (aiProvider) setProvider(aiProvider as ProviderId)
    })
  }, [])

  const handleSave = () => {
    chrome.storage.local.set({ apiKey, aiProvider: provider }, () => {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  const handleClear = () => {
    chrome.storage.local.remove(['apiKey', 'aiProvider'], () => {
      setApiKey('')
      setProvider('gemini-flash')
    })
  }

  const selected = PROVIDERS.find(p => p.id === provider)!

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <h1 className="text-lg font-bold text-primary mb-1">MediCode Assistant</h1>
      <p className="text-sm text-gray-500 mb-6">Pengaturan AI Search</p>

      <label className="block text-sm font-medium text-gray-700 mb-2">Provider AI</label>
      <div className="flex gap-2 mb-4">
        {PROVIDERS.map(p => (
          <button key={p.id} onClick={() => setProvider(p.id)}
            className={`flex-1 text-xs py-2 rounded-lg border transition-all ${provider === p.id ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
            {p.label}
          </button>
        ))}
      </div>

      <label className="block text-sm font-medium text-gray-700 mb-1">
        API Key — {selected.label}
      </label>
      <input
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder={selected.placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary mb-2"
        aria-label="API Key"
      />
      <p className="text-xs text-gray-400 mb-4">
        Dapatkan API key di{' '}
        <a href={selected.link} target="_blank" rel="noreferrer" className="text-primary underline">
          {selected.link.replace('https://', '')}
        </a>. Key disimpan lokal di browser Anda.
      </p>

      <div className="flex gap-2">
        <button onClick={handleSave}
          className="flex-1 bg-primary text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors">
          {saved ? '✓ Tersimpan' : 'Simpan'}
        </button>
        <button onClick={handleClear}
          className="px-4 bg-white border border-gray-200 text-gray-500 text-sm rounded-lg hover:border-red-300 hover:text-red-500 transition-colors">
          Hapus
        </button>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('options-root')!).render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>
)
