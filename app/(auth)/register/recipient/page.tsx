'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Droplets, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { DISTRICTS } from '@/lib/utils'

export default function RecipientRegisterPage() {
  const router    = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    district: '', area: '',
  })

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 8)              { toast.error('Password must be at least 8 characters.'); return }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match.'); return }
    if (!/^01[0-9]{9}$/.test(form.phone))       { toast.error('Enter a valid Bangladeshi phone number.'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register/recipient', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:     form.name.trim(),
          email:    form.email.toLowerCase().trim(),
          phone:    form.phone.trim(),
          password: form.password,
          district: form.district,
          area:     form.area.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Registration failed.'); return }
      toast.success('Account created! Please sign in.')
      router.push('/login?registered=1')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-crimson">
            <Droplets className="h-4 w-4 text-white" />
          </div>
          <span className="font-display font-bold text-ink">Fowzia Bloodline</span>
        </Link>
        <Link href="/login" className="text-sm text-gray-500 hover:text-ink">Already registered? Sign in</Link>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="card p-8 shadow-hover">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-trust-pale px-3 py-1 text-xs font-semibold text-trust mb-3">
                Recipient / Family Member
              </div>
              <h1 className="font-display text-2xl font-bold text-ink">Create Recipient Account</h1>
              <p className="mt-1 text-sm text-gray-500">Search and contact verified blood donors</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input className="input" placeholder="Your full name" value={form.name} onChange={e => update('name', e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Email Address</label>
                  <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} required />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input className="input" placeholder="01XXXXXXXXX" value={form.phone} onChange={e => update('phone', e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Password</label>
                  <input type="password" className="input" placeholder="Min 8 chars" value={form.password} onChange={e => update('password', e.target.value)} required />
                </div>
                <div>
                  <label className="label">Confirm Password</label>
                  <input type="password" className="input" placeholder="Repeat" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="label">District</label>
                <select className="input" value={form.district} onChange={e => update('district', e.target.value)} required>
                  <option value="">Select your district</option>
                  {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Area</label>
                <input className="input" placeholder="e.g. Mirpur, Dhanmondi" value={form.area} onChange={e => update('area', e.target.value)} required />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full mt-2" style={{ backgroundColor: '#1E40AF' }}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating...
                  </span>
                ) : (
                  <><UserPlus className="h-4 w-4" /> Create Account</>
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-gray-500">
              Want to donate blood?{' '}
              <Link href="/register/donor" className="text-crimson font-semibold hover:underline">Register as Donor</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
