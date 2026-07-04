'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Droplets, Eye, EyeOff, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { BLOOD_GROUP_LABELS, DISTRICTS } from '@/lib/utils'

type Step = 1 | 2

export default function DonorRegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    bloodGroup: '', district: '', area: '', gender: '', bkashNumber: '',
  })

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function validateStep1() {
    if (!form.name.trim() || form.name.length < 2) return 'Please enter your full name.'
    if (!form.email.includes('@'))               return 'Enter a valid email address.'
    if (!/^01[0-9]{9}$/.test(form.phone))        return 'Enter a valid Bangladeshi phone number.'
    if (form.password.length < 8)               return 'Password must be at least 8 characters.'
    if (form.password !== form.confirmPassword)  return 'Passwords do not match.'
    return null
  }

  function validateStep2() {
    if (!form.bloodGroup)       return 'Please select your blood group.'
    if (!form.district)         return 'Please select your district.'
    if (!form.area.trim())      return 'Please enter your area.'
    if (!/^01[0-9]{9}$/.test(form.bkashNumber)) return 'Enter a valid bKash number.'
    return null
  }

  function handleNext() {
    const err = validateStep1()
    if (err) { toast.error(err); return }
    setStep(2)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const err = validateStep2()
    if (err) { toast.error(err); return }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register/donor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.toLowerCase().trim(),
          phone: form.phone.trim(),
          password: form.password,
          bloodGroup: form.bloodGroup,
          district: form.district,
          area: form.area.trim(),
          gender: form.gender || null,
          bkashNumber: form.bkashNumber.trim(),
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
        <Link href="/login" className="text-sm text-gray-500 hover:text-ink">Already have an account? Sign in</Link>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {['Account Details', 'Donor Profile'].map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    step > i + 1 ? 'bg-emerald-500 text-white' :
                    step === i + 1 ? 'bg-crimson text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {step > i + 1 ? 'v' : i + 1}
                  </div>
                  <span className={`text-sm font-medium ${step === i + 1 ? 'text-ink' : 'text-gray-400'}`}>{label}</span>
                  {i === 0 && <div className="h-px flex-1 w-16 mx-3 bg-gray-200" />}
                </div>
              ))}
            </div>
          </div>

          <div className="card p-8 shadow-hover">
            <div className="mb-6">
              <h1 className="font-display text-2xl font-bold text-ink">
                {step === 1 ? 'Create Your Account' : 'Complete Donor Profile'}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {step === 1 ? 'Step 1 of 2: Basic information' : 'Step 2 of 2: Your donor details'}
              </p>
            </div>

            <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext() } : handleSubmit} className="space-y-4">
              {step === 1 ? (
                <>
                  <div>
                    <label className="label">Full Name</label>
                    <input className="input" placeholder="Your full name" value={form.name} onChange={e => update('name', e.target.value)} required />
                  </div>
                  <div>
                    <label className="label">Email Address</label>
                    <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} required />
                  </div>
                  <div>
                    <label className="label">Phone Number</label>
                    <input className="input" placeholder="01XXXXXXXXX" value={form.phone} onChange={e => update('phone', e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Password</label>
                      <div className="relative">
                        <input type={showPwd ? 'text' : 'password'} className="input pr-10" placeholder="Min 8 chars" value={form.password} onChange={e => update('password', e.target.value)} required />
                        <button type="button" tabIndex={-1} onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                          {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="label">Confirm Password</label>
                      <input type="password" className="input" placeholder="Repeat password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} required />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full mt-2">Continue</button>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Blood Group</label>
                      <select className="input" value={form.bloodGroup} onChange={e => update('bloodGroup', e.target.value)} required>
                        <option value="">Select</option>
                        {Object.entries(BLOOD_GROUP_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">Gender (optional)</label>
                      <select className="input" value={form.gender} onChange={e => update('gender', e.target.value)}>
                        <option value="">Prefer not to say</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
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
                    <label className="label">Area / Upazila</label>
                    <input className="input" placeholder="e.g. Mirpur, Dhanmondi" value={form.area} onChange={e => update('area', e.target.value)} required />
                  </div>
                  <div>
                    <label className="label">bKash Number</label>
                    <input className="input" placeholder="01XXXXXXXXX (for donation reward)" value={form.bkashNumber} onChange={e => update('bkashNumber', e.target.value)} required />
                    <p className="mt-1 text-xs text-gray-400">A small appreciation reward is sent here after each verified donation.</p>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button type="button" onClick={() => setStep(1)} className="btn-outline flex-1">Back</button>
                    <button type="submit" disabled={loading} className="btn-primary flex-1">
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Creating...
                        </span>
                      ) : (
                        <><UserPlus className="h-4 w-4" /> Create Account</>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>

            <p className="mt-5 text-center text-xs text-gray-400">
              By registering you agree to our{' '}
              <Link href="/terms" className="text-crimson hover:underline">Terms of Use</Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-crimson hover:underline">Privacy Policy</Link>.
            </p>
          </div>

          <p className="mt-4 text-center text-sm text-gray-500">
            Looking to find blood instead?{' '}
            <Link href="/register/recipient" className="text-trust font-semibold hover:underline">Register as Recipient</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
