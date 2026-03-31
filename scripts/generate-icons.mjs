// Script untuk generate PNG icon placeholder menggunakan Canvas API (Node.js built-in via jimp-free alternative)
// Karena tidak ada canvas di Node tanpa native deps, kita pakai raw PNG binary

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const iconsDir = path.resolve(__dirname, '../icons')

if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true })

// Minimal valid PNG: 1x1 blue pixel, scaled via manifest
// Format: PNG signature + IHDR + IDAT + IEND
function createMinimalPNG(size) {
  // We'll create a simple solid-color PNG using raw bytes
  // Using a pre-encoded 16x16 blue PNG as base (hex)
  // This is a valid minimal PNG with blue (#2563EB) fill

  const width = size
  const height = size

  // PNG signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR chunk
  const ihdr = Buffer.alloc(25)
  ihdr.writeUInt32BE(13, 0) // length
  ihdr.write('IHDR', 4)
  ihdr.writeUInt32BE(width, 8)
  ihdr.writeUInt32BE(height, 12)
  ihdr[16] = 8  // bit depth
  ihdr[17] = 2  // color type: RGB
  ihdr[18] = 0  // compression
  ihdr[19] = 0  // filter
  ihdr[20] = 0  // interlace
  const ihdrCrc = crc32(ihdr.slice(4, 21))
  ihdr.writeUInt32BE(ihdrCrc, 21)

  // Raw image data: each row = filter byte (0) + RGB pixels
  const rowSize = 1 + width * 3
  const raw = Buffer.alloc(height * rowSize)
  for (let y = 0; y < height; y++) {
    const offset = y * rowSize
    raw[offset] = 0 // filter type: None
    for (let x = 0; x < width; x++) {
      raw[offset + 1 + x * 3] = 0x25     // R
      raw[offset + 1 + x * 3 + 1] = 0x63 // G
      raw[offset + 1 + x * 3 + 2] = 0xEB // B (#2563EB)
    }
  }

  // Compress with zlib (deflate)
  const { deflateSync } = await import('zlib')
  // Since this is sync context, use a workaround
  const zlib = (await import('zlib'))
  const compressed = zlib.deflateSync(raw)

  // IDAT chunk
  const idatLen = compressed.length
  const idat = Buffer.alloc(12 + idatLen)
  idat.writeUInt32BE(idatLen, 0)
  idat.write('IDAT', 4)
  compressed.copy(idat, 8)
  const idatCrc = crc32(idat.slice(4, 8 + idatLen))
  idat.writeUInt32BE(idatCrc, 8 + idatLen)

  // IEND chunk
  const iend = Buffer.from([0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130])

  return Buffer.concat([sig, ihdr, idat, iend])
}

// CRC32 implementation
function crc32(buf) {
  let crc = 0xFFFFFFFF
  const table = makeCrcTable()
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF]
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function makeCrcTable() {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    }
    table[i] = c
  }
  return table
}

const sizes = [16, 48, 128]
for (const size of sizes) {
  const png = await createMinimalPNG(size)
  fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), png)
  console.log(`Generated icon${size}.png`)
}

console.log('Icons generated successfully!')
