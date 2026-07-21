'use client'

import { useState } from 'react'

const BLOOD_GROUP_MAP = {
  'A+':  'A_POS',
  'A-':  'A_NEG',
  'B+':  'B_POS',
  'B-':  'B_NEG',
  'AB+': 'AB_POS',
  'AB-': 'AB_NEG',
  'O+':  'O_POS',
  'O-':  'O_NEG',
}

const VALID_ENUM = new Set(Object.values(BLOOD_GROUP_MAP))

const DISTRICTS = [
  'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal',
  'Sylhet', 'Rangpur', 'Mymensingh', 'Comilla', 'Gazipur',
  'Narayanganj', 'Tangail', 'Jessore', 'Bogra', 'Dinajpur',
  'Faridpur', "Cox's Bazar", 'Noakhali', 'Brahmanbaria', 'Pabna',
]

const INITIAL_FORM = {
  name: '', email: '', phone: '', password: '', confirmPassword: '',
  bloodGroup: '', gender: '', district: '', area: '', bkashNumber: '',
}

export default function RegisterPage() {
  const [step, setStep]       = useState(1)
  const [form, setForm]       = useState(INITIAL_FORM)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function validateStep1() {
    if (!form.name.trim() || form.name.trim().length < 2)
      return 'Please enter your full name (at least 2 characters).'
    if (!form.email.includes('@'))
      return 'Enter a valid email address.'
    if (!/^01[0-9]{9}$/.test(form.phone))
      return 'Enter a valid Bangladeshi phone number (01XXXXXXXXX).'
    if (form.password.length < 8)
      return 'Password must be at least 8 characters.'
    if (form.password !== form.confirmPassword)
      return 'Passwords do not match.'
    return null
  }

  function validateStep2() {
    if (!form.bloodGroup)
      return 'Please select your blood group.'
    if (!form.district)
      return 'Please select your district.'
    if (!form.area.trim())
      return 'Please enter your area.'
    if (!/^01[0-9]{9}$/.test(form.bkashNumber))
      return 'Enter a valid bKash number (01XXXXXXXXX).'
    return null
  }

  function handleNext(e) {
    e.preventDefault()
    const err = validateStep1()
    if (err) { setMessage({ type: 'error', text: err }); return }
    setMessage(null)
    setStep(2)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const err = validateStep2()
    if (err) { setMessage({ type: 'error', text: err }); return }

    const mappedBloodGroup = BLOOD_GROUP_MAP[form.bloodGroup] ?? form.bloodGroup
    if (!VALID_ENUM.has(mappedBloodGroup)) {
      setMessage({ type: 'error', text: 'Invalid blood group selected.' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/auth/register/donor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:        form.name.trim(),
          email:       form.email.toLowerCase().trim(),
          phone:       form.phone.trim(),
          password:    form.password,
          bloodGroup:  mappedBloodGroup,
          district:    form.district,
          area:        form.area.trim(),
          gender:      form.gender || null,
          bkashNumber: form.bkashNumber.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error ?? 'Failed to create account. Please try again.' })
        return
      }

      setMessage({ type: 'success', text: 'Account created successfully! You can now sign in.' })
      setForm(INITIAL_FORM)
      setStep(1)
    } catch (err) {
      console.error('[REGISTER][UNEXPECTED]', err)
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            {[1, 2].map(n => (
              <div key={n} className="flex items-center gap-2">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === n ? 'bg-red-600 text-white' : step > n ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>{n}</div>
                <span className={`text-xs font-medium ${step === n ? 'text-gray-900' : 'text-gray-400'}`}>
                  {n === 1 ? 'Account' : 'Donor Profile'}
                </span>
                {n === 1 && <div className="w-8 h-px bg-gray-200 mx-1" />}
              </div>
            ))}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">
            {step === 1 ? 'Create Account' : 'Complete Donor Profile'}
          </h1>
          <p className="text-sm text-gray-500">
            {step === 1 ? 'Step 1 of 2 — Basic information' : 'Step 2 of 2 — Donor details'}
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 rounded-lg px-4 py-3 text-sm font-medium ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <form onSubmit={handleNext} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                placeholder="Your full name"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                placeholder="01XXXXXXXXX"
                value={form.phone}
                onChange={e => update('phone', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={e => update('confirmPassword', e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors mt-2"
            >
              Continue
            </button>
          </form>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  value={form.bloodGroup}
                  onChange={e => update('bloodGroup', e.target.value)}
                  required
                >
                  <option value="">Select</option>
                  {Object.keys(BLOOD_GROUP_MAP).map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender (optional)</label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  value={form.gender}
                  onChange={e => update('gender', e.target.value)}
                >
                  <option value="">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                value={form.district}
                onChange={e => update('district', e.target.value)}
                required
              >
                <option value="">Select your district</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area / Upazila</label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                placeholder="e.g. Mirpur, Dhanmondi"
                value={form.area}
                onChange={e => update('area', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">bKash Number</label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                placeholder="01XXXXXXXXX"
                value={form.bkashNumber}
                onChange={e => update('bkashNumber', e.target.value)}
                required
              />
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => { setStep(1); setMessage(null) }}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
              >
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
