import { createClient } from '@supabase/supabase-js'
import type { Env } from './env'

export const createSupabaseClient = (env: Env) => {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
}

export const createSupabaseAdminClient = (env: Env) => {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
}
