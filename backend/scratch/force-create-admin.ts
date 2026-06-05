import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { hashPassword, formatStoredPassword } from '../src/utils/password'

const loadEnv = () => {
  const envPath = path.resolve(process.cwd(), '.dev.vars')
  const envContent = fs.readFileSync(envPath, 'utf8')
  const env: Record<string, string> = {}
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
    }
  })
  return env
}

async function main() {
  const env = loadEnv()
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  
  const email = 'admin@ashmika.com'
  const password = 'admin123'
  
  console.log('Hashing password...')
  const { hash, salt } = await hashPassword(password)
  const password_hash = formatStoredPassword(salt, hash)
  
  console.log('Inserting admin...')
  const { data, error } = await supabase
    .from('admins')
    .insert([{ email, password_hash }])
    .select()
    
  if (error) {
    console.error('Error:', error.message)
  } else {
    console.log('✅ Admin created:', data[0].email)
  }
}

main()
