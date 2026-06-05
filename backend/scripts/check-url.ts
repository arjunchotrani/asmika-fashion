import * as fs from 'fs'
import * as path from 'path'

const envPath = path.resolve(process.cwd(), '.dev.vars')
const envContent = fs.readFileSync(envPath, 'utf8')

const line = envContent.split(/\r?\n/)[0]
const value = line.split('=')[1].trim()

console.log(`Value: "${value}"`)
console.log(`Length: ${value.length}`)
for (let i = 0; i < value.length; i++) {
  console.log(`Char ${i}: "${value[i]}" (Code: ${value.charCodeAt(i)})`)
}
