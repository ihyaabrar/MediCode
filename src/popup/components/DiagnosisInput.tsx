import React, { useState, useEffect, useRef } from 'react'
import { useMediStore } from '../store'
import { ensureICD10Loaded, searchICD10Local } from '../../data/db'

interface Suggestion { code: string; desc: string; desc_id: string }
interface Props { type: 'primary' | 'secondary'; id?: string }

export const DiagnosisInput: React.FC<Props> = ({ type, id }) => {
  const { primaryDiagnosis, secondaryDiagnoses, setPrimaryDiagnosis, updateSecondaryDiagnosis, removeSecondaryDiagnosis } = useMediStore()
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [dbReady, setDbReady] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [aiUsed, setAiUsed] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ensureICD10Loaded().then(() => setDbReady(true)).catch(() => setDbReady(false))
  }, [])

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setShowDropdown(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const entry = type === 'primary' ? primaryDiagnosis : secondaryDiagnoses.find(d => d.id === id)
  if (!entry) return null

  const applyEntry = (field: 'code' | 'desc', value: string) => {
    if (type === 'primary') setPrimaryDiagnosis({ ...entry, [field]: value })
    else if (id) updateSecondaryDiagnosis(id, { [field]: value })
  }

  const handleDescChange = (value: string) => {
    applyEntry('desc', value)
    setShowDropdown(false); setSuggestions([])
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.trim().length < 2) return

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true); setAiUsed(false)
      try {
        const initialResults = dbReady ? await searchICD10Local(value.trim(), 7) : []
        const seen = new Set(initialResults.map(r => r.code))
        let allResults = [...initialResults]

        // Jika hasil kurang dari 3, minta AI expand query
        if (allResults.length < 3) {
          const expanded = await chrome.runtime.sendMessage({ type: 'AI_EXPAND', query: value.trim(), searchType: 'icd10' })
          if (expanded?.terms?.length > 1) {
            setAiUsed(true)
            for (const term of expanded.terms.slice(1)) {
              if (allResults.length >= 7) break
              const more = dbReady ? await searchICD10Local(term, 7 - allResults.length) : []
              for (const r of more) {
                if (!seen.has(r.code)) { seen.add(r.code); allResults.push(r) }
              }
            }
          }
        }

        if (allResults.length) {
          setSuggestions(allResults.map(r => ({ code: r.code, desc: r.name_en, desc_id: r.name_id })))
          setShowDropdown(true)
        }
      } catch { /* silent */ } finally { setIsSearching(false) }
    }, 400)
  }

  const selectSuggestion = (s: Suggestion) => {
    const desc = s.desc_id || s.desc
    if (type === 'primary') setPrimaryDiagnosis({ ...entry, code: s.code, desc })
    else if (id) updateSecondaryDiagnosis(id, { code: s.code, desc })
    setSuggestions([]); setShowDropdown(false)
  }

  return (
    <div ref={wrapperRef} className="mb-2">
      <div className="flex gap-2 items-center">
        <input type="text" placeholder="Kode ICD-10" value={entry.code}
          onChange={e => applyEntry('code', e.target.value)}
          className="w-28 border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          aria-label="Kode ICD-10" />
        <div className="relative flex-1">
          <input type="text"
            placeholder="Ketik diagnosis (misal: dm2, usus buntu...)"
            value={entry.desc}
            onChange={e => handleDescChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary pr-6"
            aria-label="Deskripsi diagnosis" aria-autocomplete="list" aria-expanded={showDropdown} />
          {isSearching && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs animate-pulse">{aiUsed ? '🤖' : '✨'}</span>}
        </div>
        {type === 'secondary' && id && (
          <button onClick={() => removeSecondaryDiagnosis(id)}
            className="text-gray-400 hover:text-red-500 transition-colors p-1" aria-label="Hapus">🗑</button>
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50" role="listbox">
          {suggestions.map(s => (
            <button key={s.code} role="option" onClick={() => selectSuggestion(s)}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 flex gap-2 items-start border-b border-gray-50 last:border-0">
              <span className="font-mono font-semibold text-primary shrink-0 w-16 text-xs pt-0.5">{s.code}</span>
              <div className="flex-1 min-w-0">
                <p className="text-gray-800 text-xs font-medium">{s.desc_id || s.desc}</p>
                {s.desc_id && <p className="text-gray-400 text-xs">{s.desc}</p>}
              </div>
            </button>
          ))}
          <div className="px-3 py-1 bg-gray-50 border-t border-gray-100 flex items-center gap-1">
            <p className="text-xs text-gray-400">
              {aiUsed ? '🤖 AI + ' : ''}📚 ICD-10 WHO · Bahasa Indonesia
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
