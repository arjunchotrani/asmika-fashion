const b64encode = (bytes: Uint8Array): string => btoa(String.fromCharCode(...bytes))
const b64decode = (str: string): Uint8Array => new Uint8Array([...atob(str)].map(c => c.charCodeAt(0)))

export const hashPassword = async (password: string, salt?: string): Promise<{ hash: string, salt: string }> => {
  const encoder = new TextEncoder()

  const saltBytes = salt
    ? b64decode(salt)
    : crypto.getRandomValues(new Uint8Array(16))

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  )

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )

  const exportedKey = await crypto.subtle.exportKey('raw', key)
  const hashBuffer = new Uint8Array(exportedKey as ArrayBuffer)

  return { hash: b64encode(hashBuffer), salt: b64encode(saltBytes) }
}

export const verifyPassword = async (password: string, storedHash: string, storedSalt: string): Promise<boolean> => {
  const { hash } = await hashPassword(password, storedSalt)

  const a = b64decode(hash)
  const b = b64decode(storedHash)

  if (a.length !== b.length) return false

  // Constant-time XOR — iterates all bytes so timing doesn't reveal where a mismatch occurs
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i]
  }
  return diff === 0
}

export const formatStoredPassword = (salt: string, hash: string) => `${salt}:${hash}`
export const parseStoredPassword = (stored: string) => {
  const [salt, hash] = stored.split(':')
  return { salt, hash }
}
