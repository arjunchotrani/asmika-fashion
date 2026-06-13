import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { loginSchema, changePasswordSchema, forgotPasswordSchema } from '../validators/auth.validator'
import { createSupabaseAdminClient } from '../config/supabase'
import { parseStoredPassword, verifyPassword, hashPassword, formatStoredPassword } from '../utils/password'
import { generateToken } from '../utils/jwt'
import { rateLimit } from '../middleware/rateLimit'
import { authMiddleware } from '../middleware/auth'
import type { Env } from '../config/env'

const authRouter = new Hono<{ Bindings: Env }>()

// 5 login attempts per IP per 15 minutes
authRouter.post('/login', rateLimit({ max: 5, windowMs: 15 * 60 * 1000, message: 'Too many login attempts. Please wait 15 minutes.' }), zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json')
  const supabase = createSupabaseAdminClient(c.env)

  const { data: admin, error } = await supabase
    .from('admins')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !admin) {
    return c.json({ success: false, message: 'Invalid credentials' }, 401)
  }

  const { salt, hash } = parseStoredPassword(admin.password_hash)
  const isValid = await verifyPassword(password, hash, salt)

  if (!isValid) {
    return c.json({ success: false, message: 'Invalid credentials' }, 401)
  }

  const token = await generateToken({ id: admin.id, email: admin.email }, c.env.JWT_SECRET)

  return c.json({
    success: true,
    message: 'Login successful',
    data: { token, admin: { id: admin.id, email: admin.email } },
  })
})

// Change password — requires active session + 5 attempts per IP per 15 minutes
authRouter.post('/change-password', authMiddleware, rateLimit({ max: 5, windowMs: 15 * 60 * 1000, message: 'Too many attempts. Please wait 15 minutes.' }), zValidator('json', changePasswordSchema), async (c) => {
  const { currentPassword, newPassword } = c.req.valid('json')
  const email = (c.get('jwtPayload') as { email: string }).email
  const supabase = createSupabaseAdminClient(c.env)

  const { data: admin, error } = await supabase
    .from('admins')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !admin) {
    return c.json({ success: false, message: 'Invalid credentials' }, 401)
  }

  const { salt, hash } = parseStoredPassword(admin.password_hash)
  const isValid = await verifyPassword(currentPassword, hash, salt)

  if (!isValid) {
    return c.json({ success: false, message: 'Current password is incorrect' }, 401)
  }

  const { hash: newHash, salt: newSalt } = await hashPassword(newPassword)
  const newStoredPassword = formatStoredPassword(newSalt, newHash)

  const { error: updateError } = await supabase
    .from('admins')
    .update({ password_hash: newStoredPassword })
    .eq('id', admin.id)

  if (updateError) {
    return c.json({ success: false, message: 'Failed to update password' }, 500)
  }

  return c.json({ success: true, message: 'Password updated successfully' })
})

// Forgot password — 5 attempts per IP per 15 minutes
authRouter.post('/forgot-password', rateLimit({ max: 5, windowMs: 15 * 60 * 1000, message: 'Too many attempts. Please wait 15 minutes.' }), zValidator('json', forgotPasswordSchema), async (c) => {
  const { email, resetSecret, newPassword } = c.req.valid('json')

  if (resetSecret !== c.env.RESET_SECRET) {
    return c.json({ success: false, message: 'Invalid reset secret' }, 401)
  }

  const supabase = createSupabaseAdminClient(c.env)

  const { data: admin, error } = await supabase
    .from('admins')
    .select('id')
    .eq('email', email)
    .single()

  if (error || !admin) {
    return c.json({ success: false, message: 'Invalid credentials' }, 401)
  }

  const { hash: newHash, salt: newSalt } = await hashPassword(newPassword)
  const newStoredPassword = formatStoredPassword(newSalt, newHash)

  const { error: updateError } = await supabase
    .from('admins')
    .update({ password_hash: newStoredPassword })
    .eq('id', admin.id)

  if (updateError) {
    return c.json({ success: false, message: 'Failed to reset password' }, 500)
  }

  return c.json({ success: true, message: 'Password reset successfully' })
})

export default authRouter
