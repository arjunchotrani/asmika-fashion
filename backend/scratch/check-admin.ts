import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

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
  
  const { data, error } = await supabase
    .from('admins')
    .select('*')
    
  if (error) {
    console.error('Error fetching admins:', error)
  } else {
    console.log('Admins count:', data.length)
    data.forEach(admin => {
      console.log(`- ${admin.email} (Hash: ${admin.password_hash.substring(0, 20)}...)`)
    })
  }
}

main()
