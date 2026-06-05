import { Hono } from 'hono'
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { createR2Client } from '../lib/r2'
import { authMiddleware } from '../middleware/auth'
import type { Env } from '../config/env'

const uploadRouter = new Hono<{ Bindings: Env }>()

uploadRouter.use('*', authMiddleware)

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml',
])

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

const VALID_FOLDERS = new Set(['products', 'categories', 'subcategories', 'collections', 'misc'])

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

  // Support single file (file) or multiple files (files[])
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
    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      errors.push(`"${file.name}": unsupported type "${file.type}"`)
      continue
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`"${file.name}": exceeds 10 MB limit`)
      continue
    }

    const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase()
    const basename = sanitizeFilename(file.name)
    const filename = `${Date.now()}-${basename}.${ext}`
    const key = buildKey(folder, filename)

    try {
      const buffer = await file.arrayBuffer()
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
    } catch (err: any) {
      console.error(`R2 upload error for ${key}:`, err)
      errors.push(`"${file.name}": upload failed — ${err.message}`)
    }
  }

  if (results.length === 0) {
    return c.json({ success: false, message: 'All uploads failed', data: { errors } }, 500)
  }

  // Single file — return flat data object for backward compatibility
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

  // Multiple files
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

// DELETE /api/uploads — delete a file by its R2 key (folder/filename)
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
  } catch (err: any) {
    console.error(`R2 delete error for ${key}:`, err)
    return c.json({ success: false, message: 'Failed to delete file', error: err.message }, 500)
  }

  return c.json({ success: true, message: 'File deleted successfully' })
})

export default uploadRouter
