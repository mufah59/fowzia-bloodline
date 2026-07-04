'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  User, Mail, Phone, MapPin, Droplets, Shield,
  Calendar, Edit2, X, Save, Wallet,
} from 'lucide-react'
import { BLOOD_GROUP_LABELS, formatDate } from '@/lib/utils'

interface Props {
  profile: any
  role: 'DONOR' | 'RECIPIENT'
}

export default function ProfileClient({ profile, role }: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')
  const [form, setForm] = useState({
    name:        profile.user.name        as string,
    phone:       profile.user.phone       as string,
    area:        profile.area             as string,
    bio:         (profile.bio ?? '')      as string,
    bkashNumber: (profile.bkashNumber ?? '') as string,
  })

  function set(key: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }))
  }

  function cancel() {
    setForm({
      name:        profile.user.name,
      phone:       profile.user.phone,
      area:        profile.area,
      bio:         profile.bio ?? '',
      bkashNumber: profile.bkashNumber ?? '',
    })
    setError('')
    setEditing(false)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const body: Record<string, string> = { name: form.name, phone: form.phone, area: form.area }
      if (role === 'DONOR') { body.bio = form.bio; body.bkashNumber = form.bkashNumber }

      const res  = await fetch('/api/profile', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Something went wrong.'); return }
      setEditing(false)
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="flex-1 bg-surface py-8 px-4 sm:px-6 lg:px-8">
      <div className="container-site max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">My Profile</h1>
            <p className="text-sm text-gray-500 mt-1">View and update your account details</p>
          </div>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="btn-ghost flex items-center gap-2">
              <Edit2 className="h-4 w-4" /> Edit
            </button>
          ) : (
            <button onClick={cancel} className="btn-ghost flex items-center gap-2 text-gray-500">
              <X className="h-4 w-4" /> Cancel
            </button>
          )}
        </div>

        <div className="card p-6">
          {/* Avatar + name + badges */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-crimson text-white font-bold text-2xl select-none">
              {profile.user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-display text-xl font-bold text-ink">{editing ? form.name : profile.user.name}</p>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                  role === 'DONOR'
                    ? 'bg-blood-50 text-crimson border-blood-200'
                    : 'bg-trust-pale text-trust border-blue-200'
                }`}>
                  {role === 'DONOR' ? 'Blood Donor' : 'Blood Recipient'}
                </span>
                {profile.isProfileVerified && (
                  <span className="badge-verified">
                    <Shield className="h-3 w-3 mr-1" /> Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-5">
            <Row icon={<User className="h-4 w-4" />} label="Full Name">
              {editing
                ? <input value={form.name} onChange={set('name')} className="input" maxLength={80} />
                : <span>{profile.user.name}</span>
              }
            </Row>

            <Row icon={<Mail className="h-4 w-4" />} label="Email">
              <span>{profile.user.email}</span>
            </Row>

            <Row icon={<Phone className="h-4 w-4" />} label="Phone">
              {editing
                ? <input value={form.phone} onChange={set('phone')} className="input" maxLength={11} placeholder="01XXXXXXXXX" />
                : <span>{profile.user.phone}</span>
              }
            </Row>

            {role === 'DONOR' && (
              <Row icon={<Droplets className="h-4 w-4 text-crimson" />} label="Blood Group">
                <span className="badge-blood">{BLOOD_GROUP_LABELS[profile.bloodGroup] ?? profile.bloodGroup}</span>
              </Row>
            )}

            <Row icon={<MapPin className="h-4 w-4" />} label="District">
              <span>{profile.district}</span>
            </Row>

            <Row icon={<MapPin className="h-4 w-4" />} label="Area">
              {editing
                ? <input value={form.area} onChange={set('area')} className="input" maxLength={100} />
                : <span>{profile.area}</span>
              }
            </Row>

            {role === 'DONOR' && (
              <Row icon={<Wallet className="h-4 w-4" />} label="bKash Number">
                {editing
                  ? <input value={form.bkashNumber} onChange={set('bkashNumber')} className="input" maxLength={11} placeholder="01XXXXXXXXX" />
                  : <span>{profile.bkashNumber}</span>
                }
              </Row>
            )}

            {role === 'DONOR' && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5">Bio</p>
                {editing
                  ? <textarea value={form.bio} onChange={set('bio')} className="input resize-none" rows={3} maxLength={500} placeholder="Tell recipients a little about yourself..." />
                  : <p className="text-sm font-medium text-ink leading-relaxed">
                      {profile.bio || <span className="text-gray-400 italic">No bio yet.</span>}
                    </p>
                }
              </div>
            )}

            <Row icon={<Calendar className="h-4 w-4" />} label="Member Since">
              <span>{formatDate(profile.user.createdAt)}</span>
            </Row>
          </div>

          {/* Save */}
          {editing && (
            <div className="mt-6 pt-5 border-t border-gray-100">
              {error && <p className="text-sm text-blood-600 mb-3">{error}</p>}
              <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-400 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
        <div className="text-sm font-medium text-ink">{children}</div>
      </div>
    </div>
  )
}
