'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Mail, MessageSquare, Send, MapPin, Facebook, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [form, setForm]       = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.message.trim().length < 10) { toast.error('Message must be at least 10 characters.'); return }
    setLoading(true)
    try {
      const res  = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed to send.'); return }
      setSent(true)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
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
              <MessageSquare className="h-7 w-7 text-white" />
            </div>
            <h1 className="font-display text-4xl font-bold mb-3">Get in Touch</h1>
            <p className="text-white/80 leading-relaxed">
              Have a question, suggestion, or need help? Reach out directly to the founder of Fowzia Bloodline.
            </p>
          </div>
        </section>

        <section className="section bg-surface">
          <div className="container-site max-w-5xl">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

              {/* Contact Info */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-ink mb-2">Contact the Founder</h2>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Fowzia Bloodline is an individual endeavour by Minhaz Fahim. Feel free to reach out for any reason, blood emergency, feedback, partnership, or just to say thank you.
                  </p>
                </div>

                <div className="space-y-4">
                  <a
                    href="mailto:mdminhaz.uddin059@gmail.com"
                    className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 hover:border-crimson hover:shadow-sm transition-all"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blood-50">
                      <Mail className="h-5 w-5 text-crimson" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Personal Email</p>
                      <p className="text-sm font-medium text-ink">mdminhaz.uddin059@gmail.com</p>
                    </div>
                  </a>

                  <a
                    href="mailto:minhaz@autolinium.com"
                    className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 hover:border-crimson hover:shadow-sm transition-all"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blood-50">
                      <Mail className="h-5 w-5 text-crimson" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Business Email</p>
                      <p className="text-sm font-medium text-ink">minhaz@autolinium.com</p>
                    </div>
                  </a>

                  <a
                    href="https://www.facebook.com/mufah.me"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 hover:border-[#1877F2] hover:shadow-sm transition-all"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50">
                      <Facebook className="h-5 w-5 text-[#1877F2]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Facebook</p>
                      <p className="text-sm font-medium text-ink">facebook.com/mufah.me</p>
                    </div>
                  </a>

                  <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                      <MapPin className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Based in</p>
                      <p className="text-sm font-medium text-ink">Chittagong, Bangladesh</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-blood-50 border border-blood-200 p-4 text-sm text-gray-600 leading-relaxed">
                  For blood emergencies, please use the <strong className="text-crimson">Find Donors</strong> page directly for the fastest response.
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-3">
                <div className="card p-8">
                  {sent ? (
                    <div className="text-center py-10">
                      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                        <CheckCircle2 className="h-9 w-9 text-emerald-500" />
                      </div>
                      <h3 className="font-display text-xl font-bold text-ink mb-2">Message Sent!</h3>
                      <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                        Thank you for reaching out. Minhaz will get back to you as soon as possible.
                      </p>
                      <button
                        onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
                        className="btn-outline mt-6"
                      >
                        Send Another Message
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-display text-xl font-bold text-ink mb-6">Send a Message</h3>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="label">Your Name</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="Rahim Uddin"
                              value={form.name}
                              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <label className="label">Email Address</label>
                            <input
                              type="email"
                              className="input"
                              placeholder="you@example.com"
                              value={form.email}
                              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="label">Subject</label>
                          <input
                            type="text"
                            className="input"
                            placeholder="What is this about?"
                            value={form.subject}
                            onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                            required
                          />
                        </div>

                        <div>
                          <label className="label">Message</label>
                          <textarea
                            className="input resize-none"
                            rows={6}
                            placeholder="Write your message here..."
                            value={form.message}
                            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                            required
                          />
                          <p className="mt-1 text-xs text-gray-400">{form.message.length} / 2000</p>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full">
                          {loading ? (
                            <span className="flex items-center gap-2 justify-center">
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                              Sending...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2 justify-center">
                              <Send className="h-4 w-4" /> Send Message
                            </span>
                          )}
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
