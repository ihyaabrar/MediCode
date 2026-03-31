import React, { useState } from 'react'
import { useMediStore } from '../store'
import { calculateTariff, type TariffResult } from '../../data/tariff'

const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`

const SeverityBadge: React.FC<{ severity: string }> = ({ severity }) => {
  const colors: Record<string, string> = {
    NCC: 'bg-gray-100 text-gray-600',
    CC:  'bg-yellow-100 text-yellow-700',
    MCC: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[severity] ?? 'bg-gray-100 text-gray-600'}`}>
      {severity}
    </span>
  )
}

export const TariffCard: React.FC = () => {
  const { careType, roomClass, region, primaryDiagnosis, secondaryDiagnoses, procedures } = useMediStore()
  const [result, setResult] = useState<TariffResult | null>(null)
  const [error, setError] = useState('')
  const [showBreakdown, setShowBreakdown] = useState(false)

  const calculate = () => {
    if (!primaryDiagnosis.code) { setError('Isi kode diagnosis utama terlebih dahulu.'); return }
    setError('')
    const res = calculateTariff({
      primaryCode: primaryDiagnosis.code,
      secondaryCodes: secondaryDiagnoses.map(d => d.code).filter(Boolean),
      hasProcedure: procedures.length > 0,
      careType,
      roomClass,
      region,
    })
    if (!res) {
      setError(`Kode "${primaryDiagnosis.code}" tidak dikenali. Pastikan format ICD-10 benar (contoh: E11.9, I10, J18).`)
      setResult(null)
    } else {
      setResult(res)
      setShowBreakdown(false)
    }
  }

  return (
    <div className="mt-3">
      <button onClick={calculate}
        className="w-full bg-primary text-white font-semibold py-2.5 rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
        🧮 Hitung Tarif INACBG
      </button>

      {error && (
        <div className="mt-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600">{error}</div>
      )}

      {result && (
        <div className="mt-3 rounded-xl border border-green-200 overflow-hidden">
          {/* Main */}
          <div className="bg-[#F0FDF4] px-4 py-3 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-xs font-mono text-gray-500">{result.cbgCode}</span>
              <SeverityBadge severity={result.severity} />
            </div>
            <p className="text-xs text-gray-500 mb-1">{result.cbgDesc}</p>
            <p className="text-2xl font-bold text-success">{fmt(result.finalTariff)}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {careType === 'rajal' ? 'Rawat Jalan' : `Rawat Inap Kelas ${roomClass.toUpperCase()}`} · Regional {region}
            </p>
          </div>

          {/* Factor pills */}
          <div className="bg-white px-4 py-2 flex gap-2 flex-wrap border-t border-green-100">
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Base: {fmt(result.baseTariff)}</span>
            <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">Severity ×{result.severityFactor}</span>
            <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">Regional ×{result.regionalFactor}</span>
            {result.classFactor !== 1 && (
              <span className="text-xs bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full">Kelas ×{result.classFactor}</span>
            )}
          </div>

          {/* Breakdown toggle */}
          <div className="border-t border-green-100">
            <button onClick={() => setShowBreakdown(!showBreakdown)}
              className="w-full text-xs text-gray-500 hover:text-gray-700 py-2 flex items-center justify-center gap-1">
              {showBreakdown ? '▲' : '▼'} Lihat semua tarif per kelas
            </button>
            {showBreakdown && (
              <div className="bg-gray-50 px-4 pb-3 grid grid-cols-2 gap-1.5">
                {[
                  { label: 'Rawat Jalan',   key: 'rajal',         active: careType === 'rajal' },
                  { label: 'Ranap Kelas 3', key: 'ranap_kelas3',  active: careType === 'ranap' && roomClass === '3' },
                  { label: 'Ranap Kelas 2', key: 'ranap_kelas2',  active: careType === 'ranap' && roomClass === '2' },
                  { label: 'Ranap Kelas 1', key: 'ranap_kelas1',  active: careType === 'ranap' && roomClass === '1' },
                  { label: 'Ranap VIP',     key: 'ranap_vip',     active: careType === 'ranap' && roomClass === 'vip' },
                ].map(({ label, key, active }) => (
                  <div key={key} className={`rounded-lg px-3 py-2 text-xs ${active ? 'bg-green-100 border border-green-300' : 'bg-white border border-gray-200'}`}>
                    <p className={`font-medium ${active ? 'text-success' : 'text-gray-500'}`}>{label}</p>
                    <p className={`font-bold text-sm ${active ? 'text-success' : 'text-gray-700'}`}>
                      {fmt(result.breakdown[key as keyof typeof result.breakdown])}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="border-t border-green-100 bg-white px-4 py-2">
            <p className="text-xs text-gray-400 leading-relaxed">💡 {result.notes}</p>
          </div>
          <div className="bg-amber-50 px-4 py-1.5 border-t border-amber-100">
            <p className="text-xs text-amber-600 text-center">*Estimasi lokal · INACBG v5.3 · Bukan tarif resmi</p>
          </div>
        </div>
      )}
    </div>
  )
}
