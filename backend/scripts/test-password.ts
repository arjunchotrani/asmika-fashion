import { hashPassword, verifyPassword, formatStoredPassword, parseStoredPassword } from '../src/utils/password'

const main = async () => {
  const password = 'password123'
  console.log('Password:', password)
  
  const { hash, salt } = await hashPassword(password)
  console.log('Generated Salt:', salt)
  console.log('Generated Hash:', hash)
  
  const isValid = await verifyPassword(password, hash, salt)
  console.log('Is valid (immediate):', isValid)
  
  const stored = formatStoredPassword(salt, hash)
  console.log('Stored format:', stored)
  
  const parsed = parseStoredPassword(stored)
  const isValidParsed = await verifyPassword(password, parsed.hash, parsed.salt)
  console.log('Is valid (parsed):', isValidParsed)
}

main()
