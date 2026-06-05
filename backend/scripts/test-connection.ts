import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const loadEnv = () => {
  const envPath = path.resolve(process.cwd(), '.dev.vars')
  const envContent = fs.readFileSync(envPath, 'utf8')
  const env: Record<string, string> = {}
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const [key, ...valueParts] = trimmed.split('=')
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
    }
  })
  return env
}

const main = async () => {
  const env = loadEnv()
  const url = env.SUPABASE_URL
  const key = env.SUPABASE_SERVICE_ROLE_KEY

  console.log(`URL: "${url}" (Length: ${url.length})`)
  console.log(`Key Masked: ${key.substring(0, 10)}...${key.substring(key.length - 10)} (Length: ${key.length})`)
  
  const supabase = createClient(url, key)
  
  console.log('Testing storage connection...')
  const { data, error } = await supabase.storage.listBuckets()
  
  if (error) {
    console.error('Connection error:', error.message)
    console.error('Full error:', error)
  } else {
    console.log('Success! Buckets:', data.map(b => b.name))
  }
}

main()
