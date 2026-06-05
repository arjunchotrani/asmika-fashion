import * as fs from 'fs'
import * as path from 'path'

const envPath = path.resolve(process.cwd(), '.dev.vars')
const envContent = fs.readFileSync(envPath, 'utf8')

console.log('--- .dev.vars Inspection ---')
envContent.split(/\r?\n/).forEach((line, i) => {
  if (!line.trim()) return
  const [key, ...valueParts] = line.split('=')
  const value = valueParts.join('=').trim()
  console.log(`Line ${i+1}: Key="${key.trim()}", Value Length=${value.length}`)
  
  // Check for suspicious characters in the value
  const suspicious = []
  for (let j = 0; j < value.length; j++) {
    const charCode = value.charCodeAt(j)
    if (charCode < 33 || charCode > 126) {
      suspicious.push({ char: value[j], code: charCode, index: j })
    }
  }
  
  if (suspicious.length > 0) {
    console.log(`  ⚠️ Suspicious characters found:`, suspicious)
  } else {
    console.log(`  ✅ Clean string`)
  }
})
