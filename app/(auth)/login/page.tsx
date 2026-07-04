'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Droplets, Eye, EyeOff, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router       = useRouter()
  const params       = useSearchParams()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)

  const callbackUrl = params.get('callbackUrl') ?? '/'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email:    email.toLowerCase().trim(),
      password,
    })

    setLoading(false)

    if (error) {
      toast.error('Invalid email or password.')
      return
    }

    toast.success('Welcome back!')

    const role = data.user?.user_metadata?.role
    if (callbackUrl && callbackUrl !== '/') {
      router.push(callbackUrl)
    } else if (role === 'DONOR') {
      router.push('/donor/dashboard')
    } else if (role === 'RECIPIENT') {
      router.push('/recipient/dashboard')
    } else if (role === 'ADMIN') {
      router.push('/admin')
    } else {
      router.push('/')
    }
    router.refresh()
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-hero flex-col items-center justify-center p-12 text-white">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Droplets className="h-8 w-8 text-white" />
          </div>
          <h2 className="font-display text-3xl font-bold mb-4">Fowzia Bloodline</h2>
          <p className="text-white/70 leading-relaxed">
            Sign in to your account and continue making a difference. Every login is a step closer to saving a life.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-surface">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2.5 justify-center mb-8 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-crimson">
              <Droplets className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-ink">Fowzia Bloodline</span>
          </Link>

          <div className="card p-8 shadow-hover">
            <div className="mb-6">
              <h1 className="font-display text-2xl font-bold text-ink">Welcome back</h1>
              <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
            </div>

            {params.get('registered') === '1' && (
              <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                Account created successfully! Please sign in.
              </div>
            )}

            {params.get('error') === 'unauthorized' && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                You need to sign in to access that page.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label mb-0">Password</label>
                  <Link href="/forgot-password" className="text-xs text-crimson hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    className="input pr-11"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in...
                  </span>
                ) : (
                  <><LogIn className="h-4 w-4" /> Sign In</>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <Link href="/register/donor" className="text-crimson font-semibold hover:underline">
                Register as Donor
              </Link>{' '}
              or{' '}
              <Link href="/register/recipient" className="text-trust font-semibold hover:underline">
                as Recipient
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
