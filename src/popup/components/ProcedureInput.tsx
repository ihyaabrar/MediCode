import React, { useState, useEffect, useRef } from 'react'
import { useMediStore } from '../store'

interface Suggestion {
  code: string
  desc: string
}

interface Props {
  id: string
}

export const ProcedureInput: React.FC<Props> = ({ id }) => {
  const { procedures, updateProcedure, removeProcedure } = useMediStore()
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const entry = procedures.find((p) => p.id === id)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!entry) return null

  const handleDescChange = (value: string) => {
    updateProcedure(id, { desc: value })
    setShowDropdown(false)
    setSuggestions([])

    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.trim().length < 2) return

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        // Coba NLM langsung dulu
        let response = await chrome.runtime.sendMessage({ type: 'ICD9_SEARCH', query: value.trim() })
        let results = response?.results ?? []

        // Jika kurang, expand dengan AI
        if (results.length < 3) {
          const expanded = await chrome.runtime.sendMessage({ type: 'AI_EXPAND', query: value.trim(), searchType: 'icd9' })
          if (expanded?.terms?.length > 1) {
            const seen = new Set(results.map((r: { code: string }) => r.code))
            for (const term of expanded.terms.slice(1)) {
              if (results.length >= 7) break
              const more = await chrome.runtime.sendMessage({ type: 'ICD9_SEARCH', query: term })
              for (const r of (more?.results ?? [])) {
                if (!seen.has(r.code)) { seen.add(r.code); results.push(r) }
              }
            }
          }
        }

        if (results.length) { setSuggestions(results); setShowDropdown(true) }
      } catch { /* silent */ } finally { setIsSearching(false) }
    }, 400)
  }

  const selectSuggestion = (s: Suggestion) => {
    updateProcedure(id, { code: s.code, desc: s.desc })
    setSuggestions([])
    setShowDropdown(false)
  }

  return (
    <div ref={wrapperRef} className="mb-2">
      <div className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="Kode ICD-9"
          value={entry.code}
          onChange={(e) => updateProcedure(id, { code: e.target.value })}
          className="w-28 border border-secondary/40 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
          aria-label="Kode prosedur ICD-9"
        />
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Ketik tindakan (misal: appendectomy...)"
            value={entry.desc}
            onChange={(e) => handleDescChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            className="w-full border border-secondary/40 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary pr-6"
            aria-label="Deskripsi prosedur"
            aria-autocomplete="list"
            aria-expanded={showDropdown}
          />
          {isSearching && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-secondary animate-pulse">
              ✨
            </span>
          )}
        </div>
        <button
          onClick={() => removeProcedure(id)}
          className="text-gray-400 hover:text-red-500 transition-colors p-1"
          aria-label="Hapus prosedur"
        >
          🗑
        </button>
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div
          className="mt-1 bg-white border border-secondary/20 rounded-lg shadow-lg overflow-hidden z-50"
          role="listbox"
          aria-label="Saran kode ICD-9"
        >
          {suggestions.map((s) => (
            <button
              key={s.code}
              role="option"
              onClick={() => selectSuggestion(s)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-purple-50 flex gap-2 items-start border-b border-gray-50 last:border-0"
            >
              <span className="font-mono font-semibold text-secondary shrink-0">{s.code}</span>
              <span className="text-gray-600">{s.desc}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
