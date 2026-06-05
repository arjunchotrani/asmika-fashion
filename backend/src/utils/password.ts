// Utility to hash passwords using Web Crypto API since bcrypt is not edge-compatible
import { Buffer } from 'node:buffer'

export const hashPassword = async (password: string, salt?: string): Promise<{ hash: string, salt: string }> => {
  const encoder = new TextEncoder()
  
  // Use provided salt or generate a new one
  const saltBytes = salt ? 
    new Uint8Array(Buffer.from(salt, 'base64')) : 
    crypto.getRandomValues(new Uint8Array(16))
    
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
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )
  
  const exportedKey = await crypto.subtle.exportKey('raw', key)
  const hashBuffer = new Uint8Array(exportedKey as ArrayBuffer)
  
  const hashBase64 = Buffer.from(hashBuffer).toString('base64')
  const saltBase64 = Buffer.from(saltBytes).toString('base64')
  
  return { hash: hashBase64, salt: saltBase64 }
}

export const verifyPassword = async (password: string, storedHash: string, storedSalt: string): Promise<boolean> => {
  const { hash } = await hashPassword(password, storedSalt)
  return hash === storedHash
}

// Format to store in DB: `${salt}:${hash}`
export const formatStoredPassword = (salt: string, hash: string) => `${salt}:${hash}`
export const parseStoredPassword = (stored: string) => {
  const [salt, hash] = stored.split(':')
  return { salt, hash }
}
