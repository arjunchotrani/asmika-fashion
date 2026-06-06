'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Lock, Mail, Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react'
import { apiFetch } from '@/lib/api'

type Mode = 'login' | 'forgot-password'

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login')

  // Login state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Forgot password state
  const [fpEmail, setFpEmail] = useState('')
  const [fpSecret, setFpSecret] = useState('')
  const [fpNew, setFpNew] = useState('')
  const [fpConfirm, setFpConfirm] = useState('')
  const [showFpNew, setShowFpNew] = useState(false)
  const [showFpSecret, setShowFpSecret] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const router = useRouter()

  const switchMode = (next: Mode) => {
    setMode(next)
    setError('')
    setSuccess('')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (data.success) {
        const token = data.data.token
        localStorage.setItem('asmika_admin_token', token)
        document.cookie = `asmika_admin_token=${token}; path=/; max-age=604800; SameSite=Lax`
        router.push('/dashboard')
      } else {
        setError(data.message || 'Invalid credentials')
      }
    } catch {
      setError('Failed to connect to backend')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (fpNew !== fpConfirm) {
      setError('Passwords do not match')
      return
    }
    if (fpNew.length < 8) {
      setError('New password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      const res = await apiFetch('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: fpEmail, resetSecret: fpSecret, newPassword: fpNew }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess('Password reset successfully. Redirecting to login...')
        setFpEmail('')
        setFpSecret('')
        setFpNew('')
        setFpConfirm('')
        setTimeout(() => switchMode('login'), 2000)
      } else {
        setError(data.message || 'Failed to reset password')
      }
    } catch {
      setError('Failed to connect to backend')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 backdrop-blur-xl shadow-2xl">

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white uppercase">
            Ashmika Fashion
          </h1>
          <p className="text-zinc-500 text-sm">Admin Panel Portal</p>
        </div>

        {/* ── Login Form ── */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-xs text-center font-medium bg-red-500/10 py-2 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-semibold py-2.5 rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
            </button>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => switchMode('forgot-password')}
                className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors"
              >
                Forgot password?
              </button>
            </div>
          </form>
        )}

        {/* ── Forgot Password Form ── */}
        {mode === 'forgot-password' && (
          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div className="text-center space-y-1">
              <div className="flex justify-center mb-2">
                <ShieldCheck className="w-8 h-8 text-zinc-400" />
              </div>
              <p className="text-zinc-300 text-sm font-medium">Reset Password</p>
              <p className="text-zinc-500 text-xs">Enter your email, reset secret, and a new password.</p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  placeholder="Admin Email Address"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-all"
                  value={fpEmail}
                  onChange={(e) => setFpEmail(e.target.value)}
                />
              </div>

              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type={showFpSecret ? 'text' : 'password'}
                  placeholder="Reset Secret"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-all"
                  value={fpSecret}
                  onChange={(e) => setFpSecret(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowFpSecret(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  tabIndex={-1}
                >
                  {showFpSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type={showFpNew ? 'text' : 'password'}
                  placeholder="New Password (min 8 characters)"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-all"
                  value={fpNew}
                  onChange={(e) => setFpNew(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowFpNew(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  tabIndex={-1}
                >
                  {showFpNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-all"
                  value={fpConfirm}
                  onChange={(e) => setFpConfirm(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-xs text-center font-medium bg-red-500/10 py-2 rounded-md">
                {error}
              </div>
            )}
            {success && (
              <div className="text-green-400 text-xs text-center font-medium bg-green-500/10 py-2 rounded-md">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-semibold py-2.5 rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset Password'}
            </button>

            <button
              type="button"
              onClick={() => switchMode('login')}
              className="w-full text-zinc-500 hover:text-zinc-300 text-xs transition-colors"
            >
              ← Back to Sign In
            </button>
          </form>
        )}

        <p className="text-center text-zinc-600 text-xs mt-8">
          &copy; 2026 Ashmika Fashion. All rights reserved.
        </p>
      </div>
    </div>
  )
}
