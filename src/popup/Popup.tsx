import React, { useState, useEffect } from 'react'
import { useMediStore } from './store'
import { DiagnosisInput } from './components/DiagnosisInput'
import { ProcedureInput } from './components/ProcedureInput'
import { TariffCard } from './components/TariffCard'

const PROVIDERS = [
  { id: 'gemini-flash', label: 'Gemini Flash', placeholder: 'AIza...', link: 'https://aistudio.google.com/app/apikey' },
  { id: 'groq',         label: 'Groq',         placeholder: 'gsk_...',  link: 'https://console.groq.com/keys' },
  { id: 'openrouter',   label: 'OpenRouter',   placeholder: 'sk-or-...', link: 'https://openrouter.ai/keys' },
] as const
type ProviderId = typeof PROVIDERS[number]['id']

const AISetupBanner: React.FC<{ onSaved: () => void }> = ({ onSaved }) => {
  const [open, setOpen] = useState(false)
  const [provider, setProvider] = useState<ProviderId>('gemini-flash')
  const [key, setKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const selected = PROVIDERS.find(p => p.id === provider)!

  const save = async (skip = false) => {
    if (!key.trim()) { setError('API key tidak boleh kosong.'); return }
    if (skip) {
      chrome.storage.local.set({ aiProvider: provider, apiKey: key.trim() }, onSaved)
      return
    }
    setSaving(true); setError('')
    try {
      // Simpan provider dulu agar background bisa baca saat validasi
      await new Promise<void>(resolve => chrome.storage.local.set({ aiProvider: provider }, resolve))
      const res = await chrome.runtime.sendMessage({ type: 'AI_VALIDATE', apiKey: key.trim() })
      if (res?.error) { setError(res.error); return }
      await new Promise<void>(resolve => chrome.storage.local.set({ apiKey: key.trim() }, resolve))
      onSaved()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  if (!open) return (
    <div className="mx-4 mb-3 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex items-center justify-between">
      <p className="text-xs text-blue-600">🤖 Setup AI untuk pencarian cerdas</p>
      <button onClick={() => setOpen(true)} className="text-xs text-blue-700 font-semibold hover:underline">Setup</button>
    </div>
  )

  return (
    <div className="mx-4 mb-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-blue-700">🤖 Setup AI Search</p>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
      </div>
      <div className="flex gap-1 mb-2">
        {PROVIDERS.map(p => (
          <button key={p.id} onClick={() => { setProvider(p.id); setKey('') }}
            className={`flex-1 text-xs py-1 rounded-lg border transition-all ${provider === p.id ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-gray-200'}`}>
            {p.label}
          </button>
        ))}
      </div>
      <input type="password" value={key} onChange={e => setKey(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && save()}
        placeholder={selected.placeholder}
        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-primary mb-1" />
      {error && <p className="text-xs text-red-500 mb-1">{error}</p>}
      <div className="flex gap-1.5">
        <button onClick={() => save()} disabled={saving}
          className="flex-1 bg-primary text-white text-xs py-1.5 rounded-lg disabled:opacity-50">
          {saving ? 'Verifikasi...' : 'Simpan'}
        </button>
        <button onClick={() => save(true)} className="flex-1 bg-white border border-gray-200 text-gray-500 text-xs py-1.5 rounded-lg">
          Lewati verifikasi
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-1">
        <button onClick={() => chrome.tabs.create({ url: selected.link })} className="text-primary underline">{selected.link.replace('https://', '')}</button>
      </p>
    </div>
  )
}

const SectionHeader: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div className="flex items-center gap-2 mb-2">
    <div className={`w-1 h-4 rounded-full ${color}`} />
    <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">{label}</p>
  </div>
)

export const Popup: React.FC = () => {
  const [hasKey, setHasKey] = useState(false)

  useEffect(() => {
    chrome.storage.local.get('apiKey', ({ apiKey }) => setHasKey(!!apiKey))
  }, [])

  const {
    careType, setCareType, roomClass, setRoomClass, region, setRegion,
    secondaryDiagnoses, addSecondaryDiagnosis,
    procedures, addProcedure,
  } = useMediStore()

  return (
    <div className="w-[400px] font-sans bg-white flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex items-center gap-2">
        <span className="text-xl">🏥</span>
        <div>
          <h1 className="text-sm font-bold text-primary leading-none">MediCode Assistant</h1>
          <p className="text-xs text-gray-400">INACBG v5.3 · ICD-10 WHO</p>
        </div>
      </div>

      {/* AI Setup Banner — tampil jika belum ada API key, atau tombol ganti key */}
      {!hasKey
        ? <AISetupBanner onSaved={() => setHasKey(true)} />
        : (
          <div className="mx-4 mb-3 flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
            <p className="text-xs text-green-700">🤖 AI aktif</p>
            <button
              onClick={() => chrome.storage.local.remove(['apiKey', 'aiProvider'], () => setHasKey(false))}
              className="text-xs text-gray-400 hover:text-red-500">
              Ganti key
            </button>
          </div>
        )
      }

      <div className="px-4 py-3 overflow-y-auto" style={{ maxHeight: '540px' }}>
        {/* Care type toggle */}
        <div className="flex gap-1.5 mb-4 bg-gray-100 p-1 rounded-xl">
          {(['rajal', 'ranap'] as const).map(t => (
            <button key={t} onClick={() => setCareType(t)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                careType === t ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {t === 'rajal' ? '🚶 Rawat Jalan' : '🛏 Rawat Inap'}
            </button>
          ))}
        </div>

        {/* Kelas & Regional — ranap only */}
        {careType === 'ranap' && (
          <div className="flex gap-2 mb-4">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Kelas</label>
              <select value={roomClass} onChange={e => setRoomClass(e.target.value as typeof roomClass)}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-primary bg-white">
                <option value="3">Kelas 3</option>
                <option value="2">Kelas 2</option>
                <option value="1">Kelas 1</option>
                <option value="vip">VIP</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Regional</label>
              <select value={region} onChange={e => setRegion(e.target.value as typeof region)}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-primary bg-white">
                {(['1','2','3','4','5'] as const).map(r => (
                  <option key={r} value={r}>Regional {r}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Diagnosis ICD-10 */}
        <div className="mb-4">
          <SectionHeader color="bg-primary" label="Diagnosis ICD-10" />
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold">Utama</span>
          </div>
          <DiagnosisInput type="primary" />
          {secondaryDiagnoses.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 mb-1">
              <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-semibold">Sekunder</span>
            </div>
          )}
          {secondaryDiagnoses.map(d => <DiagnosisInput key={d.id} type="secondary" id={d.id} />)}
          <button onClick={addSecondaryDiagnosis}
            className="mt-1.5 text-xs text-primary hover:text-blue-700 flex items-center gap-1 font-medium">
            <span className="text-base leading-none">+</span> Tambah Diagnosis Sekunder
          </button>
        </div>

        {/* Prosedur ICD-9 */}
        <div className="mb-4">
          <SectionHeader color="bg-secondary" label="Prosedur ICD-9-CM" />
          {procedures.map(p => <ProcedureInput key={p.id} id={p.id} />)}
          <button onClick={addProcedure}
            className="mt-1.5 text-xs text-secondary hover:text-purple-700 flex items-center gap-1 font-medium">
            <span className="text-base leading-none">+</span> Tambah Tindakan
          </button>
        </div>

        <TariffCard />
        <p className="text-center text-xs text-gray-300 mt-3 pb-1">MediCode v1.0.0</p>
      </div>
    </div>
  )
}
