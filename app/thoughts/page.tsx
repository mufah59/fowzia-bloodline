'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { MessageSquare, Send, Heart, MapPin, Briefcase, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Thought {
  id:         string
  name:       string
  profession: string
  location:   string
  comment:    string
  createdAt:  string
}

export default function ThoughtsPage() {
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', profession: '', location: '', comment: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/thoughts')
      .then(r => r.json())
      .then(data => { setThoughts(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.comment.trim().length < 10) { toast.error('Please write at least 10 characters.'); return }
    setSubmitting(true)
    try {
      const res  = await fetch('/api/thoughts', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed to submit.'); return }
      setSubmitted(true)
      setShowForm(false)
    } catch {
      toast.error('Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">

        {/* Hero */}
        <section className="bg-hero text-white py-16">
          <div className="container-site px-4 sm:px-6 lg:px-8 text-center max-w-2xl mx-auto">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
              <Heart className="h-7 w-7 text-white fill-white/60" />
            </div>
            <h1 className="font-display text-4xl font-bold mb-3">Thoughts on This Platform</h1>
            <p className="text-white/80 leading-relaxed">
              Real words from real people. Share what this platform means to you.
            </p>
          </div>
        </section>

        <section className="section bg-surface">
          <div className="container-site max-w-3xl">

            {/* CTA */}
            {!submitted ? (
              <div className="mb-10">
                {!showForm ? (
                  <div className="text-center">
                    <button
                      onClick={() => setShowForm(true)}
                      className="inline-flex items-center gap-3 rounded-2xl bg-crimson px-8 py-4 text-base font-bold text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                    >
                      <MessageSquare className="h-5 w-5" />
                      Add your thought about this platform
                    </button>
                    <p className="mt-3 text-sm text-gray-400">All thoughts are reviewed before appearing publicly.</p>
                  </div>
                ) : (
                  <div className="card p-8 shadow-hover animate-slide-up">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-display text-xl font-bold text-ink">Share Your Thought</h2>
                      <button onClick={() => setShowForm(false)} className="btn-ghost text-sm px-3 py-1.5">Cancel</button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="label">Your Name</label>
                          <input type="text" className="input" placeholder="Rahim Uddin"
                            value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                        </div>
                        <div>
                          <label className="label">Profession</label>
                          <input type="text" className="input" placeholder="Student, Doctor, Engineer..."
                            value={form.profession} onChange={e => setForm(f => ({ ...f, profession: e.target.value }))} required />
                        </div>
                      </div>
                      <div>
                        <label className="label">Your Location</label>
                        <input type="text" className="input" placeholder="Dhaka, Chittagong..."
                          value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} required />
                      </div>
                      <div>
                        <label className="label">Your Thought</label>
                        <textarea className="input resize-none" rows={4}
                          placeholder="What do you think about Fowzia Bloodline? How has it helped you or your community?"
                          value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} required />
                        <p className="mt-1 text-xs text-gray-400">{form.comment.length} / 1000</p>
                      </div>
                      <button type="submit" disabled={submitting} className="btn-primary w-full">
                        {submitting ? (
                          <span className="flex items-center gap-2 justify-center">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            Submitting...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 justify-center">
                            <Send className="h-4 w-4" /> Submit Thought
                          </span>
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-10 text-center card p-8 animate-slide-up">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="font-display text-xl font-bold text-ink mb-2">Thank you for sharing!</h3>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">
                  Your thought has been submitted and will appear here once reviewed. We appreciate your words.
                </p>
              </div>
            )}

            {/* Thoughts list */}
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="card p-6 animate-pulse">
                    <div className="flex gap-3 mb-4">
                      <div className="h-10 w-10 rounded-full bg-gray-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-100 rounded" />
                      <div className="h-3 bg-gray-100 rounded w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            ) : thoughts.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium text-gray-500">No thoughts yet</p>
                <p className="text-sm mt-1">Be the first to share yours.</p>
              </div>
            ) : (
              <div className="space-y-5">
                <p className="text-sm text-gray-400 mb-2">{thoughts.length} thought{thoughts.length !== 1 ? 's' : ''} shared</p>
                {thoughts.map(t => (
                  <div key={t.id} className="card-hover p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-full bg-blood-50 text-crimson font-bold text-lg">
                        {t.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
                          <p className="font-semibold text-ink">{t.name}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Briefcase className="h-3 w-3" /> {t.profession}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <MapPin className="h-3 w-3" /> {t.location}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">"{t.comment}"</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
