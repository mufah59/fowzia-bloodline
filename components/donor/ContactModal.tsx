'use client'

import { useState } from 'react'
import { X, Phone, Shield, AlertCircle } from 'lucide-react'
import { BLOOD_GROUP_LABELS, DISTRICTS } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Props {
  donor:   any
  onClose: () => void
}

export default function ContactModal({ donor, onClose }: Props) {
  const [reason,    setReason]   = useState('')
  const [loading,   setLoading]  = useState(false)
  const [revealed,  setRevealed] = useState<{ name: string; phone: string } | null>(null)

  async function handleRequest() {
    if (reason.trim().length < 10) { toast.error('Please provide a brief reason (min 10 characters).'); return }
    setLoading(true)

    try {
      const res = await fetch('/api/contact-requests', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorProfileId: donor.id,
          bloodGroup:     donor.bloodGroup,
          reason:         reason.trim(),
        }),
      })
      const data = await res.json()

      if (!res.ok) { toast.error(data.error ?? 'Request failed.'); return }

      if (data.approved) {
        setRevealed({ name: data.name, phone: data.phone })
      } else {
        toast.success('Your request has been submitted. You will be notified once approved.')
        onClose()
      }
    } catch {
      toast.error('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md card p-6 shadow-hover animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold text-ink">Contact Donor</h2>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {revealed ? (
          <div className="text-center py-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <Phone className="h-8 w-8 text-emerald-500" />
            </div>
            <p className="font-display text-lg font-bold text-ink mb-1">{revealed.name}</p>
            <p className="text-2xl font-bold text-crimson mb-4">{revealed.phone}</p>
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 mb-5">
              Please contact them respectfully. This information is confidential.
            </div>
            <div className="flex gap-3">
              <a
                href={`tel:${revealed.phone}`}
                className="btn-primary flex-1"
              >
                <Phone className="h-4 w-4" /> Call Now
              </a>
              <button onClick={onClose} className="btn-outline flex-1">Done</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3 rounded-lg bg-blood-50 border border-blood-200 p-4 mb-5">
              <Shield className="h-5 w-5 text-crimson flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700">
                <strong>Privacy protected.</strong> Donor contact details are revealed only after your request is approved.
                Do not misuse this information.
              </div>
            </div>

            <div className="mb-4">
              <div className="flex gap-3 text-sm mb-3">
                <div className="flex-1 rounded-lg bg-gray-50 p-3">
                  <p className="text-gray-400 text-xs mb-0.5">Donor</p>
                  <p className="font-semibold text-ink">{donor.name}</p>
                </div>
                <div className="flex-1 rounded-lg bg-gray-50 p-3">
                  <p className="text-gray-400 text-xs mb-0.5">Blood Group</p>
                  <p className="font-semibold text-crimson">{BLOOD_GROUP_LABELS[donor.bloodGroup]}</p>
                </div>
              </div>
            </div>

            <div className="mb-5">
              <label className="label">Reason for Contact</label>
              <textarea
                className="input resize-none"
                rows={3}
                placeholder="Briefly explain why you need this donor (patient name, urgency, hospital, etc.)"
                value={reason}
                onChange={e => setReason(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-400">{reason.length} / 500 characters</p>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              Abuse of contact requests may result in account suspension.
            </div>

            <div className="flex gap-3">
              <button onClick={onClose}      className="btn-outline flex-1">Cancel</button>
              <button onClick={handleRequest} disabled={loading} className="btn-primary flex-1">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Requesting...
                  </span>
                ) : 'Request Contact'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
