# 🏥 MediCode Assistant

> Asisten koding medis cerdas untuk tenaga kesehatan Indonesia — pencarian kode ICD-10/ICD-9 dan estimasi tarif INACBG langsung di browser.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Manifest](https://img.shields.io/badge/manifest-v3-green)
![License](https://img.shields.io/badge/license-Proprietary-red)

---

## ✨ Fitur Utama

| Fitur | Keterangan |
|---|---|
| 🔍 Pencarian ICD-10 | Data resmi WHO, tersimpan lokal (offline), Bahasa Indonesia |
| 🔍 Pencarian ICD-9-CM | Prosedur tindakan via NLM API |
| 🤖 AI Smart Search | Translate istilah informal → kode resmi (dm2, usus buntu, dll) |
| 🧮 Kalkulator INACBG | Estimasi tarif Rawat Jalan & Rawat Inap per kelas & regional |
| ⚡ Severity Detection | Otomatis deteksi CC/MCC dari kode diagnosis sekunder |
| 🌐 Multi AI Provider | Gemini Flash, Groq, OpenRouter — pilih yang gratis |
| 🔒 Privasi | Semua data tersimpan lokal, tidak ada server pihak ketiga |

---

## 🖼️ Tampilan

```
┌─────────────────────────────────────┐
│ 🏥 MediCode Assistant               │
│    INACBG v5.3 · ICD-10 WHO         │
├─────────────────────────────────────┤
│  🚶 Rawat Jalan  │  🛏 Rawat Inap   │
├─────────────────────────────────────┤
│ DIAGNOSIS ICD-10                    │
│ [Utama]  E11.9 │ Diabetes Melitus.. │
│ [Sekunder] L97 │ Ulkus kaki..       │
├─────────────────────────────────────┤
│ PROSEDUR ICD-9-CM                   │
│ 93.57 │ Application of wound dress  │
├─────────────────────────────────────┤
│      🧮 Hitung Tarif INACBG         │
│  ┌──────────────────────────────┐   │
│  │ D-4-10-I        [CC]         │   │
│  │ Rp 2.184.750                 │   │
│  │ Base ×1.3 ×1.2 ×Regional     │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## 🚀 Instalasi

### Dari Source

```bash
# Clone repo
git clone https://github.com/ihyaabrar/MediCode.git
cd MediCode

# Install dependencies
npm install

# Build
npm run build
```

Lalu load di Chrome:
1. Buka `chrome://extensions`
2. Aktifkan **Developer mode**
3. Klik **Load unpacked** → pilih folder `build/`

---

## ⚙️ Setup AI (Opsional)

AI digunakan untuk menerjemahkan istilah informal ke kode ICD resmi. Tanpa AI, pencarian tetap berjalan menggunakan database lokal.

| Provider | Gratis | Link |
|---|---|---|
| Gemini Flash | ✅ | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| Groq (Llama 3.3) | ✅ | [console.groq.com](https://console.groq.com/keys) |
| OpenRouter | ✅ Free tier | [openrouter.ai](https://openrouter.ai/keys) |

---

## 🧮 Logika Kalkulasi INACBG

```
Tarif Rajal  = Base × Severity × Regional
Tarif Ranap  = Base × Severity × Prosedur × Regional × Kelas
```

| Parameter | Nilai |
|---|---|
| Severity NCC | ×1.0 |
| Severity CC | ×1.3 |
| Severity MCC | ×1.6 |
| Ada tindakan (ranap) | ×1.2 |
| Regional 1–5 | ×1.0 – ×1.4 |
| Kelas 3 / 2 / 1 / VIP | ×1.0 / ×1.25 / ×1.5 / ×1.75 |

> ⚠️ Hasil kalkulasi adalah **estimasi** berdasarkan INACBG v5.3. Bukan tarif resmi. Selalu verifikasi dengan software e-Klaim resmi Kemenkes.

---

## 🗂️ Struktur Proyek

```
MediCode/
├── src/
│   ├── background/index.ts     # Service Worker, AI & NLM API
│   ├── data/
│   │   ├── db.ts               # IndexedDB (Dexie.js) + ICD-10 loader
│   │   └── tariff.ts           # Logika kalkulasi INACBG lokal
│   ├── popup/
│   │   ├── components/
│   │   │   ├── DiagnosisInput.tsx
│   │   │   ├── ProcedureInput.tsx
│   │   │   └── TariffCard.tsx
│   │   ├── Popup.tsx
│   │   ├── store.ts            # Zustand state management
│   │   └── index.css
│   └── options/main.tsx        # Halaman pengaturan API key
├── icons/                      # Icon extension
├── manifest.json
├── vite.config.ts
└── package.json
```

---

## 🛠️ Tech Stack

- **React 18** + TypeScript
- **Vite 5** — build tool
- **Tailwind CSS** — styling
- **Zustand** — state management
- **Dexie.js** — IndexedDB wrapper
- **NLM Clinical Tables API** — data ICD-10/ICD-9 resmi
- **Chrome Extension Manifest V3**

---

## 📦 Sumber Data

| Data | Sumber |
|---|---|
| ICD-10 WHO | [fendis0709/icd-10](https://github.com/fendis0709/icd-10) — Bahasa Indonesia |
| ICD-9-CM Prosedur | [NLM Clinical Tables API](https://clinicaltables.nlm.nih.gov/apidoc/icd9cm_sg/v3/doc.html) |
| Tarif INACBG | Estimasi berdasarkan Permenkes No.3/2023 |

---

## 📄 Lisensi

Lihat file [LICENSE](./LICENSE) untuk detail lengkap.

---

*Dibuat dengan ❤️ untuk tenaga kesehatan Indonesia*
