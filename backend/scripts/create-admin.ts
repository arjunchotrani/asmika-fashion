import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'
import { hashPassword, formatStoredPassword } from '../src/utils/password'

// Helper to load .dev.vars
const loadEnv = () => {
  const envPath = path.resolve(process.cwd(), '.dev.vars')
  if (!fs.existsSync(envPath)) {
    console.error('Error: .dev.vars file not found. Please create it first.')
    process.exit(1)
  }

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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query: string): Promise<string> => {
  return new Promise(resolve => rl.question(query, resolve))
}

const main = async () => {
  console.log('\n--- Asmika Fashion Admin Creation Utility ---\n')

  const env = loadEnv()
  const supabaseUrl = env.SUPABASE_URL
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in .dev.vars')
    process.exit(1)
  }

  const email = await question('Enter admin email: ')
  if (!email || !email.includes('@')) {
    console.error('Error: Invalid email address')
    process.exit(1)
  }

  const password = await question('Enter admin password: ')
  if (!password || password.length < 8) {
    console.error('Error: Password must be at least 8 characters long')
    process.exit(1)
  }

  const confirmPassword = await question('Confirm password: ')
  if (password !== confirmPassword) {
    console.error('Error: Passwords do not match')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log('\nGenerating secure hash...')
  const { hash, salt } = await hashPassword(password)
  const password_hash = formatStoredPassword(salt, hash)

  console.log('Registering admin in Supabase...')
  
  const { data, error } = await supabase
    .from('admins')
    .insert([{ email, password_hash }])
    .select()

  if (error) {
    if (error.code === '23505') {
      console.error('\nError: An admin with this email already exists.')
    } else {
      console.error('\nError creating admin:', error.message)
    }
    process.exit(1)
  }

  console.log('\n✅ Admin created successfully!')
  console.log(`ID: ${data[0].id}`)
  console.log(`Email: ${data[0].email}`)
  
  rl.close()
}

main().catch(err => {
  console.error('\nUnexpected error:', err)
  process.exit(1)
})
