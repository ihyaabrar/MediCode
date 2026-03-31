import Dexie, { type Table } from 'dexie'

export interface ICD10 {
  id?: number
  code: string
  name_en: string
  name_id: string
}

export interface ICD9 {
  id?: number
  code: string
  desc: string
}

export interface Tarif {
  id?: number
  group_code: string
  rajal: number
  ranap_1: number
  ranap_2: number
  ranap_3: number
}

export interface AppMeta {
  key: string
  value: string
}

export class MediCodeDB extends Dexie {
  master_icd10!: Table<ICD10>
  master_icd9!: Table<ICD9>
  master_tarif!: Table<Tarif>
  app_meta!: Table<AppMeta>

  constructor() {
    super('MediCodeDB')
    this.version(2).stores({
      master_icd10: '++id, code, name_en, name_id',
      master_icd9: '++id, code',
      master_tarif: '++id, group_code',
      app_meta: 'key',
    })
  }
}

export const db = new MediCodeDB()

const ICD10_JSON_URL = 'https://raw.githubusercontent.com/fendis0709/icd-10/master/master_icd_x.json'

// Singleton promise — pastikan hanya satu download yang berjalan
let loadPromise: Promise<void> | null = null

export function ensureICD10Loaded(): Promise<void> {
  if (!loadPromise) {
    loadPromise = _loadICD10().catch((err) => {
      loadPromise = null // reset agar bisa retry
      throw err
    })
  }
  return loadPromise
}

async function _loadICD10(): Promise<void> {
  const meta = await db.app_meta.get('icd10_loaded')
  if (meta?.value === 'true') return

  const res = await fetch(ICD10_JSON_URL)
  if (!res.ok) throw new Error(`Gagal mengunduh data ICD-10: ${res.status}`)

  const raw: { kode_icd: string; nama_icd: string; nama_icd_indo: string }[] = await res.json()

  await db.master_icd10.clear()
  await db.master_icd10.bulkAdd(
    raw.map(r => ({
      code: r.kode_icd.trim(),
      name_en: r.nama_icd.trim(),
      name_id: r.nama_icd_indo.trim(),
    }))
  )
  await db.app_meta.put({ key: 'icd10_loaded', value: 'true' })
}

export async function searchICD10Local(query: string, limit = 7): Promise<ICD10[]> {
  const q = query.toLowerCase().trim()
  if (!q) return []

  // Cari by kode dulu (exact prefix)
  const byCode = await db.master_icd10
    .filter(r => r.code.toLowerCase().startsWith(q))
    .limit(limit)
    .toArray()

  if (byCode.length >= limit) return byCode

  // Lalu cari by nama Indonesia
  const byNameId = await db.master_icd10
    .filter(r =>
      !r.code.toLowerCase().startsWith(q) &&
      r.name_id.toLowerCase().includes(q)
    )
    .limit(limit - byCode.length)
    .toArray()

  // Lalu cari by nama Inggris
  const remaining = limit - byCode.length - byNameId.length
  const byNameEn = remaining > 0
    ? await db.master_icd10
        .filter(r =>
          !r.code.toLowerCase().startsWith(q) &&
          !r.name_id.toLowerCase().includes(q) &&
          r.name_en.toLowerCase().includes(q)
        )
        .limit(remaining)
        .toArray()
    : []

  return [...byCode, ...byNameId, ...byNameEn]
}
