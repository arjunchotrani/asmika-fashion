import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { hashPassword, formatStoredPassword } from '../src/utils/password'

const API_URL = 'http://127.0.0.1:8788'
const TEST_EMAIL = `test-${Date.now()}@ashmika.com`
const TEST_PASSWORD = 'password123'
const IMAGE_PATH = 'C:/Users/acer/.gemini/antigravity/brain/e3bba4bd-7338-48ca-99e0-07e796e12b59/test_product_image_1778854181689.png'

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

const main = async () => {
  console.log('--- STARTING COMPREHENSIVE BACKEND TESTS ---\n')
  const env = loadEnv()
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

  // 1. Setup Test Admin
  console.log('[1/5] Setting up test admin...')
  const { hash, salt } = await hashPassword(TEST_PASSWORD)
  const password_hash = formatStoredPassword(salt, hash)
  
  const { error: adminError } = await supabase
    .from('admins')
    .upsert([{ email: TEST_EMAIL, password_hash }], { onConflict: 'email' })

  if (adminError) throw new Error('Failed to setup test admin: ' + adminError.message)
  console.log('✅ Test admin ready: ' + TEST_EMAIL)

  // 2. Test Login
  console.log('\n[2/5] Testing Login Flow...')
  const loginRes = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
  })
  const loginData: any = await loginRes.json()
  
  if (!loginData.success) throw new Error('Login failed: ' + loginData.message)
  const token = loginData.data.token
  console.log('✅ Login successful. JWT obtained.')

  // 3. Test Protected Route
  console.log('\n[3/5] Testing Protected Route (Enquiries)...')
  const enquiryRes = await fetch(`${API_URL}/api/enquiries`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  const enquiryData: any = await enquiryRes.json()
  if (!enquiryData.success) throw new Error('Protected route access failed')
  console.log('✅ Protected route accessible.')

  // 4. Test Image Upload
  console.log('\n[4/5] Testing Image Upload to "products" bucket...')
  if (!fs.existsSync(IMAGE_PATH)) {
    console.warn('⚠️ Test image not found at ' + IMAGE_PATH + '. Skipping upload test.')
  } else {
    const formData = new FormData()
    const fileBuffer = fs.readFileSync(IMAGE_PATH)
    const blob = new Blob([fileBuffer], { type: 'image/png' })
    formData.append('file', blob, 'test-product.png')
    formData.append('folder', 'products')

    const uploadRes = await fetch(`${API_URL}/api/uploads`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    })
    const uploadData: any = await uploadRes.json()
    if (!uploadData.success) {
      console.error('❌ Upload failed:', uploadData.message, uploadData.error)
    } else {
      console.log('✅ Upload successful!')
      console.log('   URL:', uploadData.data.url)
    }
  }

  // 5. Test CRUD (Category)
  console.log('\n[5/5] Testing Category Creation...')
  const catRes = await fetch(`${API_URL}/api/categories`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({
      name: 'Silk Collection',
      slug: 'silk-collection',
      description: 'The finest silk from Ashmika Fashion',
      status: 'published'
    })
  })
  const catData: any = await catRes.json()
  if (!catData.success) {
    console.error('❌ Category creation failed:', catData.message)
  } else {
    console.log('✅ Category created successfully: ' + catData.data.name)
  }

  console.log('\n--- ALL TESTS COMPLETED ---')
}

main().catch(err => {
  console.error('\nTests failed:', err.message)
  process.exit(1)
})
