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
  
  const { data, error } = await supabase.rpc('get_table_info', { table_name: 'categories' })
  
  if (error) {
    // If RPC doesn't exist, try fetching a single row
    console.log('RPC failed, trying sample row...')
    const { data: sample, error: sampleError } = await supabase.from('categories').select('*').limit(1)
    if (sampleError) {
      console.error('Sample failed:', sampleError)
    } else {
      console.log('Columns:', Object.keys(sample[0] || {}))
    }
  } else {
    console.log('Table info:', data)
  }
}

main()
