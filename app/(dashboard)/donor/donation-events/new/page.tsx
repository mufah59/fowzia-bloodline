'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Upload, PlusCircle, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'

export default function NewDonationEventPage() {
  const router  = useRouter()
  const [form, setForm] = useState({
    donationDate: new Date().toISOString().split('T')[0],
    hospitalName: '',
    notes: '',
  })
  const [proofFile, setProofFile]     = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const [uploading, setUploading]     = useState(false)
  const [submitting, setSubmitting]   = useState(false)

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('File must be under 5MB.'); return }
    setProofFile(file)
    setProofPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!proofFile) { toast.error('Please upload proof of donation.'); return }
    if (!form.hospitalName.trim()) { toast.error('Hospital name is required.'); return }

    setUploading(true)
    let proofImageUrl = ''

    try {
      // Upload to UploadThing
      const uploadData = new FormData()
      uploadData.append('files', proofFile)
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadData })
      if (!uploadRes.ok) throw new Error('Upload failed')
      const uploadJson = await uploadRes.json()
      proofImageUrl = uploadJson.url
    } catch {
      toast.error('Failed to upload proof image. Please try again.')
      setUploading(false)
      return
    }

    setUploading(false)
    setSubmitting(true)

    try {
      const res = await fetch('/api/donations', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donationDate:  new Date(form.donationDate).toISOString(),
          hospitalName:  form.hospitalName.trim(),
          notes:         form.notes.trim() || undefined,
          proofImageUrl,
        }),
      })

      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Submission failed.'); return }

      toast.success('Donation event submitted for review!')
      router.push('/donor/dashboard')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-surface py-8 px-4 sm:px-6 lg:px-8">
        <div className="container-site max-w-2xl">
          <Link href="/donor/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-ink mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>

          <div className="card p-8 shadow-hover">
            <div className="mb-7">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blood-50">
                  <PlusCircle className="h-5 w-5 text-crimson" />
                </div>
                <div>
                  <h1 className="font-display text-xl font-bold text-ink">Log Donation Event</h1>
                  <p className="text-sm text-gray-500">This will be submitted for admin verification</p>
                </div>
              </div>
              <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
                After admin approval, your last donation date will update and your reward will be sent to your bKash.
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Date of Donation</label>
                <input
                  type="date"
                  className="input"
                  value={form.donationDate}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={e => update('donationDate', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label">Hospital / Blood Bank Name</label>
                <input
                  className="input"
                  placeholder="e.g. Dhaka Medical College Hospital"
                  value={form.hospitalName}
                  onChange={e => update('hospitalName', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label">Notes (optional)</label>
                <textarea
                  className="input resize-none"
                  rows={3}
                  placeholder="Any additional context about this donation..."
                  value={form.notes}
                  onChange={e => update('notes', e.target.value)}
                />
              </div>

              <div>
                <label className="label">
                  Proof of Donation <span className="text-crimson">*</span>
                </label>
                <div className={`relative mt-1 flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
                  proofPreview ? 'border-emerald-300 bg-emerald-50' : 'border-gray-300 bg-gray-50 hover:border-crimson hover:bg-blood-50'
                }`}>
                  {proofPreview ? (
                    <div className="w-full p-4">
                      <img src={proofPreview} alt="Proof preview" className="max-h-48 mx-auto rounded-lg object-contain" />
                      <p className="text-center text-xs text-emerald-600 mt-2 font-medium">Image selected: {proofFile?.name}</p>
                    </div>
                  ) : (
                    <div className="py-10 text-center">
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-3" />
                      <p className="text-sm text-gray-600 font-medium">Click to upload proof</p>
                      <p className="text-xs text-gray-400 mt-1">Donation receipt, hospital document, max 5MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Link href="/donor/dashboard" className="btn-outline flex-1 text-center">Cancel</Link>
                <button type="submit" disabled={uploading || submitting} className="btn-primary flex-1">
                  {uploading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Uploading...
                    </span>
                  ) : submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Submitting...
                    </span>
                  ) : (
                    <><PlusCircle className="h-4 w-4" /> Submit for Review</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
