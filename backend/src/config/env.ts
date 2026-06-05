export type Env = {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  JWT_SECRET: string
  RESET_SECRET: string
  // Cloudflare R2
  R2_ACCESS_KEY_ID: string
  R2_SECRET_ACCESS_KEY: string
  R2_ENDPOINT: string
  R2_BUCKET_NAME: string
  R2_PUBLIC_URL: string
}
