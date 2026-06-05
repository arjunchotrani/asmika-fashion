import { hashPassword } from '../src/utils/password'

const main = async () => {
  const password = 'password123'
  const local = await hashPassword(password)
  console.log('Local Hash:', local.hash)
  
  const res = await fetch('http://127.0.0.1:8788/api/test/hash', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  })
  const remote: any = await res.json()
  console.log('Remote Hash (Salted differently):', remote.hash)
  
  // To compare truly, we need the same salt
  const res2 = await fetch('http://127.0.0.1:8788/api/test/hash', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  })
  const remote2: any = await res2.json()
  
  const localWithRemoteSalt = await hashPassword(password, remote2.salt)
  console.log('Remote Salt:', remote2.salt)
  console.log('Remote Hash with that salt:', remote2.hash)
  console.log('Local Hash with that salt:', localWithRemoteSalt.hash)
  
  if (remote2.hash === localWithRemoteSalt.hash) {
    console.log('✅ MATCH! The environments are consistent.')
  } else {
    console.log('❌ MISMATCH! The environments produce different hashes.')
  }
}

main()
