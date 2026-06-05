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
  
  // Try to insert a dummy row into collections and see error if columns don't match
  const { error } = await supabase.from('collections').insert([{ 
    name: 'test', 
    slug: 'test', 
    banner_image: 'http://example.com' 
  }])
  
  if (error) {
    console.log('Error inserting into collections:', error.message)
  } else {
    console.log('Successfully inserted into collections with banner_image')
    // Clean up
    await supabase.from('collections').delete().eq('slug', 'test')
  }

  // Same for products
  const { error: pError } = await supabase.from('products').insert([{
    title: 'test',
    slug: 'test',
    price: 0,
    stock_quantity: 0
  }])

  if (pError) {
    console.log('Error inserting into products:', pError.message)
  } else {
    console.log('Successfully inserted into products with title')
    await supabase.from('products').delete().eq('slug', 'test')
  }
}

main()
