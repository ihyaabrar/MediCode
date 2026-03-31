// Mapping prefix ICD-10 → grup CBG + tarif dasar INACBG v5.3
// Sumber: Permenkes No.3/2023, disederhanakan untuk estimasi

export interface CBGGroup {
  code: string
  desc: string
  baseTariffRajal: number
  baseTariffRanap: number
}

// Tarif dasar dalam Rupiah (Regional 1, Kelas 3, NCC)
const CBG_MAP: { prefix: string; group: CBGGroup }[] = [
  // Infeksi & Parasit (A00-B99)
  { prefix: 'A', group: { code: 'A-4-10-I', desc: 'Penyakit Infeksi & Parasit', baseTariffRajal: 350000, baseTariffRanap: 1200000 } },
  { prefix: 'B', group: { code: 'A-4-10-I', desc: 'Penyakit Infeksi & Parasit', baseTariffRajal: 350000, baseTariffRanap: 1200000 } },
  // Neoplasma (C00-D49)
  { prefix: 'C', group: { code: 'B-4-10-I', desc: 'Neoplasma Ganas', baseTariffRajal: 800000, baseTariffRanap: 3500000 } },
  { prefix: 'D0', group: { code: 'B-4-10-I', desc: 'Neoplasma In Situ', baseTariffRajal: 600000, baseTariffRanap: 2500000 } },
  { prefix: 'D1', group: { code: 'B-4-11-I', desc: 'Neoplasma Jinak', baseTariffRajal: 450000, baseTariffRanap: 1800000 } },
  { prefix: 'D2', group: { code: 'B-4-11-I', desc: 'Neoplasma Jinak', baseTariffRajal: 450000, baseTariffRanap: 1800000 } },
  { prefix: 'D3', group: { code: 'B-4-11-I', desc: 'Neoplasma Jinak', baseTariffRajal: 450000, baseTariffRanap: 1800000 } },
  { prefix: 'D4', group: { code: 'B-4-11-I', desc: 'Neoplasma Jinak', baseTariffRajal: 450000, baseTariffRanap: 1800000 } },
  // Darah & Imun (D50-D89)
  { prefix: 'D5', group: { code: 'C-4-10-I', desc: 'Penyakit Darah & Imun', baseTariffRajal: 400000, baseTariffRanap: 1500000 } },
  { prefix: 'D6', group: { code: 'C-4-10-I', desc: 'Penyakit Darah & Imun', baseTariffRajal: 400000, baseTariffRanap: 1500000 } },
  { prefix: 'D7', group: { code: 'C-4-10-I', desc: 'Penyakit Darah & Imun', baseTariffRajal: 400000, baseTariffRanap: 1500000 } },
  { prefix: 'D8', group: { code: 'C-4-10-I', desc: 'Penyakit Darah & Imun', baseTariffRajal: 400000, baseTariffRanap: 1500000 } },
  // Endokrin (E00-E89)
  { prefix: 'E', group: { code: 'D-4-10-I', desc: 'Penyakit Endokrin & Metabolik', baseTariffRajal: 380000, baseTariffRanap: 1350000 } },
  // Mental (F00-F99)
  { prefix: 'F', group: { code: 'E-4-10-I', desc: 'Gangguan Mental & Perilaku', baseTariffRajal: 350000, baseTariffRanap: 1100000 } },
  // Saraf (G00-G99)
  { prefix: 'G', group: { code: 'F-4-10-I', desc: 'Penyakit Sistem Saraf', baseTariffRajal: 450000, baseTariffRanap: 1800000 } },
  // Mata (H00-H59)
  { prefix: 'H0', group: { code: 'G-4-10-I', desc: 'Penyakit Mata', baseTariffRajal: 400000, baseTariffRanap: 1600000 } },
  { prefix: 'H1', group: { code: 'G-4-10-I', desc: 'Penyakit Mata', baseTariffRajal: 400000, baseTariffRanap: 1600000 } },
  { prefix: 'H2', group: { code: 'G-4-10-I', desc: 'Penyakit Mata', baseTariffRajal: 400000, baseTariffRanap: 1600000 } },
  { prefix: 'H3', group: { code: 'G-4-10-I', desc: 'Penyakit Mata', baseTariffRajal: 400000, baseTariffRanap: 1600000 } },
  { prefix: 'H4', group: { code: 'G-4-10-I', desc: 'Penyakit Mata', baseTariffRajal: 400000, baseTariffRanap: 1600000 } },
  { prefix: 'H5', group: { code: 'G-4-10-I', desc: 'Penyakit Mata', baseTariffRajal: 400000, baseTariffRanap: 1600000 } },
  // THT (H60-H95)
  { prefix: 'H6', group: { code: 'H-4-10-I', desc: 'Penyakit THT', baseTariffRajal: 380000, baseTariffRanap: 1400000 } },
  { prefix: 'H7', group: { code: 'H-4-10-I', desc: 'Penyakit THT', baseTariffRajal: 380000, baseTariffRanap: 1400000 } },
  { prefix: 'H8', group: { code: 'H-4-10-I', desc: 'Penyakit THT', baseTariffRajal: 380000, baseTariffRanap: 1400000 } },
  { prefix: 'H9', group: { code: 'H-4-10-I', desc: 'Penyakit THT', baseTariffRajal: 380000, baseTariffRanap: 1400000 } },
  // Sirkulasi (I00-I99)
  { prefix: 'I', group: { code: 'I-4-10-I', desc: 'Penyakit Sistem Sirkulasi', baseTariffRajal: 500000, baseTariffRanap: 2500000 } },
  // Pernapasan (J00-J99)
  { prefix: 'J', group: { code: 'J-4-10-I', desc: 'Penyakit Sistem Pernapasan', baseTariffRajal: 400000, baseTariffRanap: 1600000 } },
  // Pencernaan (K00-K95)
  { prefix: 'K', group: { code: 'K-4-10-I', desc: 'Penyakit Sistem Pencernaan', baseTariffRajal: 420000, baseTariffRanap: 1700000 } },
  // Kulit (L00-L99)
  { prefix: 'L', group: { code: 'L-4-10-I', desc: 'Penyakit Kulit & Jaringan Subkutan', baseTariffRajal: 320000, baseTariffRanap: 1100000 } },
  // Muskuloskeletal (M00-M99)
  { prefix: 'M', group: { code: 'M-4-10-I', desc: 'Penyakit Muskuloskeletal', baseTariffRajal: 380000, baseTariffRanap: 1500000 } },
  // Genitourinari (N00-N99)
  { prefix: 'N', group: { code: 'N-4-10-I', desc: 'Penyakit Sistem Genitourinari', baseTariffRajal: 400000, baseTariffRanap: 1600000 } },
  // Kehamilan (O00-O9A)
  { prefix: 'O', group: { code: 'O-4-10-I', desc: 'Kehamilan, Persalinan & Nifas', baseTariffRajal: 450000, baseTariffRanap: 2200000 } },
  // Perinatal (P00-P96)
  { prefix: 'P', group: { code: 'P-4-10-I', desc: 'Kondisi Perinatal', baseTariffRajal: 500000, baseTariffRanap: 2000000 } },
  // Kongenital (Q00-Q99)
  { prefix: 'Q', group: { code: 'Q-4-10-I', desc: 'Malformasi Kongenital', baseTariffRajal: 500000, baseTariffRanap: 2200000 } },
  // Gejala (R00-R99)
  { prefix: 'R', group: { code: 'R-4-10-I', desc: 'Gejala & Tanda Tidak Terklasifikasi', baseTariffRajal: 280000, baseTariffRanap: 900000 } },
  // Cedera (S00-T98)
  { prefix: 'S', group: { code: 'S-4-10-I', desc: 'Cedera & Keracunan', baseTariffRajal: 450000, baseTariffRanap: 1800000 } },
  { prefix: 'T', group: { code: 'S-4-10-I', desc: 'Cedera & Keracunan', baseTariffRajal: 450000, baseTariffRanap: 1800000 } },
  // Faktor Eksternal (V00-Y99)
  { prefix: 'V', group: { code: 'T-4-10-I', desc: 'Faktor Eksternal', baseTariffRajal: 300000, baseTariffRanap: 1000000 } },
  { prefix: 'W', group: { code: 'T-4-10-I', desc: 'Faktor Eksternal', baseTariffRajal: 300000, baseTariffRanap: 1000000 } },
  { prefix: 'X', group: { code: 'T-4-10-I', desc: 'Faktor Eksternal', baseTariffRajal: 300000, baseTariffRanap: 1000000 } },
  { prefix: 'Y', group: { code: 'T-4-10-I', desc: 'Faktor Eksternal', baseTariffRajal: 300000, baseTariffRanap: 1000000 } },
  // Kontak Layanan Kesehatan (Z00-Z99)
  { prefix: 'Z', group: { code: 'U-4-10-I', desc: 'Faktor Kontak Layanan Kesehatan', baseTariffRajal: 200000, baseTariffRanap: 700000 } },
]

// Daftar prefix ICD-10 yang termasuk CC (Complication/Comorbidity) jika jadi diagnosis sekunder
// Berdasarkan panduan INACBG — komplikasi yang secara klinis signifikan
const CC_PREFIXES = [
  'E10','E11','E12','E13','E14', // Diabetes dengan komplikasi
  'I21','I22','I50','I63','I64', // Infark, gagal jantung, stroke
  'J18','J44','J45','J96',       // Pneumonia, PPOK, asma, gagal napas
  'N17','N18','N19',             // Gagal ginjal
  'K70','K72','K74',             // Penyakit hati
  'L89','L97','L98',             // Ulkus dekubitus, ulkus kaki
  'A41','A40',                   // Sepsis
  'G93','G35',                   // Ensefalopati, MS
]

const MCC_PREFIXES = [
  'I21','I22',                   // Infark miokard akut
  'A41','A40',                   // Sepsis
  'J96',                         // Gagal napas akut
  'N17',                         // Gagal ginjal akut
  'G93',                         // Ensefalopati
  'I63','I64',                   // Stroke akut
]

function getSeverity(secondaryCodes: string[]): { severity: string; severityFactor: number } {
  if (secondaryCodes.length === 0) return { severity: 'NCC', severityFactor: 1.0 }

  const normalize = (s: string) => s.toUpperCase().split('.').join('')

  const hasMCC = secondaryCodes.some(code =>
    MCC_PREFIXES.some(p => normalize(code).startsWith(normalize(p)))
  )
  if (hasMCC) return { severity: 'MCC', severityFactor: 1.6 }

  const hasCC = secondaryCodes.some(code =>
    CC_PREFIXES.some(p => normalize(code).startsWith(normalize(p)))
  )
  if (hasCC) return { severity: 'CC', severityFactor: 1.3 }

  return { severity: 'NCC', severityFactor: 1.0 }
}

export const REGIONAL_FACTOR: Record<string, number> = {
  '1': 1.00, '2': 1.10, '3': 1.20, '4': 1.30, '5': 1.40,
}

export const CLASS_FACTOR: Record<string, number> = {
  '3': 1.00, '2': 1.25, '1': 1.50, 'vip': 1.75,
}

export function getCBGGroup(icdCode: string): CBGGroup | null {
  const code = icdCode.toUpperCase().trim()
  // Coba match dari yang paling spesifik (2 karakter) ke yang umum (1 karakter)
  for (let len = 2; len >= 1; len--) {
    const prefix = code.slice(0, len)
    const match = CBG_MAP.find(m => m.prefix === prefix)
    if (match) return match.group
  }
  return null
}

export interface TariffResult {
  cbgCode: string
  cbgDesc: string
  severity: string
  severityFactor: number
  baseTariff: number
  regionalFactor: number
  classFactor: number
  finalTariff: number
  breakdown: {
    rajal: number
    ranap_kelas3: number
    ranap_kelas2: number
    ranap_kelas1: number
    ranap_vip: number
  }
  notes: string
}

export function calculateTariff(params: {
  primaryCode: string
  secondaryCodes: string[]   // kode ICD-10 diagnosis sekunder
  hasProcedure: boolean
  careType: 'rajal' | 'ranap'
  roomClass: string
  region: string
}): TariffResult | null {
  const { primaryCode, secondaryCodes, hasProcedure, careType, roomClass, region } = params
  const group = getCBGGroup(primaryCode)
  if (!group) return null

  // Severity berdasarkan kode diagnosis sekunder (CC/MCC aware)
  const { severity, severityFactor } = getSeverity(secondaryCodes)

  // Prosedur hanya menaikkan tarif RANAP, bukan rajal
  const procedureFactor = (careType === 'ranap' && hasProcedure) ? 1.2 : 1.0

  const regionalFactor = REGIONAL_FACTOR[region] ?? 1.0
  const classFactor = CLASS_FACTOR[roomClass] ?? 1.0

  const baseRajal = group.baseTariffRajal
  const baseRanap = group.baseTariffRanap

  // Rajal: base × severity × regional (tidak ada class/procedure factor)
  const calcRajal = (base: number) =>
    Math.round(base * severityFactor * regionalFactor)

  // Ranap: base × severity × procedure × regional × class
  const calcRanap = (base: number, cf: number) =>
    Math.round(base * severityFactor * procedureFactor * regionalFactor * cf)

  const finalTariff = careType === 'rajal'
    ? calcRajal(baseRajal)
    : calcRanap(baseRanap, classFactor)

  const procedureNote = hasProcedure
    ? careType === 'ranap' ? ' · Ada tindakan (×1.2)' : ' · Ada tindakan (tidak mempengaruhi tarif rajal)'
    : ''

  return {
    cbgCode: group.code,
    cbgDesc: group.desc,
    severity,
    severityFactor,
    baseTariff: careType === 'rajal' ? baseRajal : baseRanap,
    regionalFactor,
    classFactor: careType === 'rajal' ? 1.0 : classFactor,
    finalTariff,
    breakdown: {
      rajal:        calcRajal(baseRajal),
      ranap_kelas3: calcRanap(baseRanap, 1.0),
      ranap_kelas2: calcRanap(baseRanap, 1.25),
      ranap_kelas1: calcRanap(baseRanap, 1.5),
      ranap_vip:    calcRanap(baseRanap, 1.75),
    },
    notes: `Grup ${group.code} · Severity ${severity} (×${severityFactor})${procedureNote} · Regional ${region} (×${regionalFactor})`,
  }
}
