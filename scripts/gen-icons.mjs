import { createWriteStream } from 'fs'
import { mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import zlib from 'zlib'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(__dirname, '../icons')
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

function crc32(buf) {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    table[i] = c
  }
  let crc = 0xFFFFFFFF
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF]
  return ((crc ^ 0xFFFFFFFF) >>> 0)
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const t = Buffer.from(type)
  const crcBuf = Buffer.concat([t, data])
  const c = Buffer.alloc(4); c.writeUInt32BE(crc32(crcBuf))
  return Buffer.concat([len, t, data, c])
}

function makePNG(size, r, g, b) {
  const sig = Buffer.from([137,80,78,71,13,10,26,10])

  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(size, 0); ihdrData.writeUInt32BE(size, 4)
  ihdrData[8] = 8; ihdrData[9] = 2 // 8-bit RGB

  const rowSize = 1 + size * 3
  const raw = Buffer.alloc(size * rowSize)
  for (let y = 0; y < size; y++) {
    const off = y * rowSize
    raw[off] = 0
    for (let x = 0; x < size; x++) {
      raw[off + 1 + x*3] = r
      raw[off + 1 + x*3+1] = g
      raw[off + 1 + x*3+2] = b
    }
  }

  const compressed = zlib.deflateSync(raw)
  return Buffer.concat([sig, chunk('IHDR', ihdrData), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))])
}

// Biru medis #2563EB = rgb(37, 99, 235)
for (const size of [16, 48, 128]) {
  const png = makePNG(size, 37, 99, 235)
  const out = resolve(outDir, `icon${size}.png`)
  createWriteStream(out).write(png)
  console.log(`✓ icon${size}.png`)
}
