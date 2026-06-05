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
  
  console.log('Subcategories sample row...')
  const { data: sub, error: subErr } = await supabase.from('subcategories').select('*').limit(1)
  console.log('Subcategories Columns:', Object.keys(sub?.[0] || {}))

  console.log('Collections sample row...')
  const { data: col, error: colErr } = await supabase.from('collections').select('*').limit(1)
  console.log('Collections Columns:', Object.keys(col?.[0] || {}))

  console.log('Products sample row...')
  const { data: prod, error: prodErr } = await supabase.from('products').select('*').limit(1)
  console.log('Products Columns:', Object.keys(prod?.[0] || {}))
}

main()
