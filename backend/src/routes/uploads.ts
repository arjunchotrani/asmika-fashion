import { Hono } from 'hono'
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { createR2Client } from '../lib/r2'
import { authMiddleware } from '../middleware/auth'
import type { Env } from '../config/env'

const uploadRouter = new Hono<{ Bindings: Env }>()

uploadRouter.use('*', authMiddleware)

// SVG intentionally excluded — SVGs can contain embedded JavaScript (XSS risk)
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
])

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

const VALID_FOLDERS = new Set(['products', 'categories', 'subcategories', 'collections', 'misc'])

// Magic byte validators — guards against client-spoofed Content-Type
const MAGIC_BYTES: Record<string, (b: Uint8Array) => boolean> = {
  'image/jpeg': (b) => b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF,
  'image/jpg':  (b) => b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF,
  'image/png':  (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47,
  'image/webp': (b) =>
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  'image/gif':  (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38,
  // AVIF is ISOBMFF: bytes 4–7 must spell 'ftyp'
  'image/avif': (b) => b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70,
}

function sanitizeFilename(original: string): string {
  const noExt = original.replace(/\.[^.]+$/, '')
  return noExt
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'file'
}

function buildKey(folder: string, filename: string): string {
  return `${folder}/${filename}`
}

// POST /api/uploads — single or multiple file upload
uploadRouter.post('/', async (c) => {
  const body = await c.req.parseBody({ all: true })

  const folder = ((body['folder'] as string) || 'misc').trim()
  if (!VALID_FOLDERS.has(folder)) {
    return c.json({
      success: false,
      message: `Invalid folder. Allowed: ${[...VALID_FOLDERS].join(', ')}`,
    }, 400)
  }

  const rawFiles = body['files[]'] ?? body['file']
  const fileList: File[] = Array.isArray(rawFiles)
    ? rawFiles.filter((f): f is File => f instanceof File)
    : rawFiles instanceof File
    ? [rawFiles]
    : []

  if (fileList.length === 0) {
    return c.json({ success: false, message: 'No file uploaded' }, 400)
  }

  const r2 = createR2Client(c.env)
  const results: Array<{ url: string; filename: string; folder: string; size: number }> = []
  const errors: string[] = []

  for (const file of fileList) {
    // Validate declared MIME type
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      errors.push(`"${file.name}": unsupported type "${file.type}"`)
      continue
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`"${file.name}": exceeds 10 MB limit`)
      continue
    }

    // Read file bytes
    let buffer: ArrayBuffer
    try {
      buffer = await file.arrayBuffer()
    } catch {
      errors.push(`"${file.name}": could not read file`)
      continue
    }

    // Magic byte validation — verify content matches declared MIME type
    const headerBytes = new Uint8Array(buffer.slice(0, Math.min(12, buffer.byteLength)))
    const magicCheck = MAGIC_BYTES[file.type]
    if (magicCheck && !magicCheck(headerBytes)) {
      errors.push(`"${file.name}": file content does not match declared type`)
      continue
    }

    const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase()
    const basename = sanitizeFilename(file.name)
    const filename = `${Date.now()}-${basename}.${ext}`
    const key = buildKey(folder, filename)

    try {
      await r2.send(
        new PutObjectCommand({
          Bucket: c.env.R2_BUCKET_NAME,
          Key: key,
          Body: new Uint8Array(buffer),
          ContentType: file.type,
          ContentLength: file.size,
        })
      )

      const publicUrl = `${c.env.R2_PUBLIC_URL}/${key}`
      results.push({ url: publicUrl, filename, folder, size: file.size })
    } catch (err) {
      console.error(`R2 upload error for ${key}:`, err)
      errors.push(`"${file.name}": upload failed`)
    }
  }

  if (results.length === 0) {
    return c.json({ success: false, message: 'All uploads failed', data: { errors } }, 500)
  }

  if (results.length === 1) {
    return c.json(
      {
        success: true,
        message: 'File uploaded successfully',
        data: results[0],
        ...(errors.length > 0 ? { errors } : {}),
      },
      201
    )
  }

  return c.json(
    {
      success: true,
      message: `${results.length} file(s) uploaded successfully`,
      data: results,
      ...(errors.length > 0 ? { errors } : {}),
    },
    201
  )
})

// DELETE /api/uploads — delete a file by its R2 key
uploadRouter.delete('/', async (c) => {
  let body: { key?: string }
  try {
    body = await c.req.json()
  } catch {
    return c.json({ success: false, message: 'Invalid JSON body' }, 400)
  }

  const { key } = body
  if (!key || typeof key !== 'string' || !key.trim()) {
    return c.json({ success: false, message: 'File key is required (e.g. "products/1716039283-saree.jpg")' }, 400)
  }

  const r2 = createR2Client(c.env)
  try {
    await r2.send(
      new DeleteObjectCommand({
        Bucket: c.env.R2_BUCKET_NAME,
        Key: key.trim(),
      })
    )
  } catch (err) {
    console.error(`R2 delete error for ${key}:`, err)
    return c.json({ success: false, message: 'Failed to delete file' }, 500)
  }

  return c.json({ success: true, message: 'File deleted successfully' })
})

export default uploadRouter
