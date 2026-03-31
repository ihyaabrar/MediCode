import { create } from 'zustand'

export type CareType = 'rajal' | 'ranap'
export type RoomClass = '1' | '2' | '3' | 'vip'
export type Region = '1' | '2' | '3' | '4' | '5'

export interface DiagnosisEntry {
  id: string
  code: string
  desc: string
}

export interface ProcedureEntry {
  id: string
  code: string
  desc: string
}

interface MediState {
  careType: CareType
  roomClass: RoomClass
  region: Region
  primaryDiagnosis: DiagnosisEntry
  secondaryDiagnoses: DiagnosisEntry[]
  procedures: ProcedureEntry[]

  setCareType: (t: CareType) => void
  setRoomClass: (c: RoomClass) => void
  setRegion: (r: Region) => void
  setPrimaryDiagnosis: (d: DiagnosisEntry) => void
  addSecondaryDiagnosis: () => void
  updateSecondaryDiagnosis: (id: string, d: Partial<DiagnosisEntry>) => void
  removeSecondaryDiagnosis: (id: string) => void
  addProcedure: () => void
  updateProcedure: (id: string, p: Partial<ProcedureEntry>) => void
  removeProcedure: (id: string) => void
}

const uid = () => Math.random().toString(36).slice(2, 9)

export const useMediStore = create<MediState>((set) => ({
  careType: 'rajal',
  roomClass: '3',
  region: '1',
  primaryDiagnosis: { id: 'primary', code: '', desc: '' },
  secondaryDiagnoses: [],
  procedures: [],

  setCareType: (t) => set({ careType: t }),
  setRoomClass: (c) => set({ roomClass: c }),
  setRegion: (r) => set({ region: r }),
  setPrimaryDiagnosis: (d) => set({ primaryDiagnosis: d }),

  addSecondaryDiagnosis: () =>
    set((s) => ({
      secondaryDiagnoses: [...s.secondaryDiagnoses, { id: uid(), code: '', desc: '' }],
    })),

  updateSecondaryDiagnosis: (id, d) =>
    set((s) => ({
      secondaryDiagnoses: s.secondaryDiagnoses.map((x) => (x.id === id ? { ...x, ...d } : x)),
    })),

  removeSecondaryDiagnosis: (id) =>
    set((s) => ({ secondaryDiagnoses: s.secondaryDiagnoses.filter((x) => x.id !== id) })),

  addProcedure: () =>
    set((s) => ({
      procedures: [...s.procedures, { id: uid(), code: '', desc: '' }],
    })),

  updateProcedure: (id, p) =>
    set((s) => ({
      procedures: s.procedures.map((x) => (x.id === id ? { ...x, ...p } : x)),
    })),

  removeProcedure: (id) =>
    set((s) => ({ procedures: s.procedures.filter((x) => x.id !== id) })),
}))
