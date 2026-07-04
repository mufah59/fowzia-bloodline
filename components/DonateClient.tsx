'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Heart, Copy, CheckCheck, Droplets, Award, Users,
  ArrowRight, Star, Info, ChevronDown, ChevronUp,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'

const BKASH_NUMBER  = '+8801533633084'
const MIN_AMOUNT    = 120
const COCONUT_COST  = 120

interface Props {
  stats:        { totalDonors: number; totalAmount: number; totalCoconuts: number }
  recentDonors: any[]
}

export default function DonateClient({ stats, recentDonors }: Props) {
  const [copied, setCopied]       = useState(false)
  const [step,   setStep]         = useState<1 | 2>(1)
  const [showFaq, setShowFaq]     = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone]           = useState(false)

  const [form, setForm] = useState({
    name:        '',
    profession:  '',
    bkashNumber: '',
    amount:      '',
    txReference: '',
    message:     '',
  })

  function update(f: string, v: string) { setForm(p => ({ ...p, [f]: v })) }

  async function copyNumber() {
    await navigator.clipboard.writeText(BKASH_NUMBER)
    setCopied(true)
    toast.success('bKash number copied!')
    setTimeout(() => setCopied(false), 3000)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amount = parseFloat(form.amount)
    if (!form.name.trim())              { toast.error('Please enter your full name.'); return }
    if (!/^01[0-9]{9}$/.test(form.bkashNumber)) { toast.error('Enter a valid bKash number.'); return }
    if (isNaN(amount) || amount < MIN_AMOUNT)   { toast.error(`Minimum donation is ৳${MIN_AMOUNT}.`); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/platform-donations', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:        form.name.trim(),
          profession:  form.profession.trim() || null,
          bkashNumber: form.bkashNumber.trim(),
          amount,
          txReference: form.txReference.trim() || null,
          message:     form.message.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Submission failed.'); return }
      setDone(true)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const coconutsFromAmount = Math.floor(parseFloat(form.amount || '0') / COCONUT_COST)

  if (done) {
    return (
      <main className="flex-1 bg-surface flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full card p-10 text-center shadow-hover animate-slide-up">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
            <Heart className="h-10 w-10 text-emerald-500 fill-emerald-200" />
          </div>
          <h2 className="font-display text-2xl font-bold text-ink mb-3">Thank You!</h2>
          <p className="text-gray-600 leading-relaxed mb-2">
            Your support has been recorded. Our admin will verify your bKash transaction within 24 hours and add you to the public Donor Wall.
          </p>
          <p className="text-sm text-gray-400 mb-7">
            Your generosity funds the coconut reward for blood donors, a small thank-you that means everything.
          </p>
          <div className="flex gap-3">
            <Link href="/donors-wall" className="btn-primary flex-1">View Donor Wall</Link>
            <Link href="/" className="btn-outline flex-1">Back to Home</Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 bg-surface">
      {/* Hero */}
      <section className="bg-hero text-white py-16">
        <div className="container-site px-4 sm:px-6 lg:px-8 text-center max-w-3xl mx-auto">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
            <Heart className="h-7 w-7 text-white fill-white" />
          </div>
          <h1 className="font-display text-4xl font-bold mb-4">Support Fowzia Bloodline</h1>
          <p className="text-lg text-white/80 leading-relaxed">
            Your donation keeps this platform free and funds the <strong className="text-white">coconut reward (DaaB)</strong> we send to every verified blood donor, a small act of gratitude that means the world to them.
          </p>
        </div>
      </section>

      {/* Impact stats */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-site px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            {[
              { label: 'Platform Supporters',  value: stats.totalDonors,   icon: Users,   color: 'text-crimson'   },
              { label: 'Total Raised (BDT)',    value: `৳ ${stats.totalAmount.toLocaleString()}`, icon: Heart, color: 'text-crimson' },
              { label: 'Coconuts Funded',       value: stats.totalCoconuts, icon: Award,  color: 'text-gold'      },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center gap-3 px-6 py-5">
                <Icon className={`h-6 w-6 flex-shrink-0 ${color}`} />
                <div>
                  <p className="font-display text-2xl font-bold text-ink">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-site px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* LEFT, Instructions + form */}
          <div className="lg:col-span-3 space-y-6">

            {/* Step indicator */}
            <div className="flex gap-2">
              {[
                { n: 1, label: 'Send via bKash' },
                { n: 2, label: 'Register Here'  },
              ].map(({ n, label }) => (
                <button
                  key={n}
                  onClick={() => setStep(n as 1 | 2)}
                  className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold border transition-colors ${
                    step === n
                      ? 'bg-crimson text-white border-crimson'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                    step === n ? 'bg-white text-crimson' : 'bg-gray-100 text-gray-500'
                  }`}>{n}</span>
                  {label}
                </button>
              ))}
            </div>

            {/* STEP 1, bKash instructions */}
            {step === 1 && (
              <div className="card p-7 shadow-hover">
                <h2 className="font-display text-xl font-bold text-ink mb-5 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-crimson text-white text-sm font-bold">1</span>
                  Send Money via bKash
                </h2>

                {/* bKash number card */}
                <div className="rounded-xl bg-gradient-to-br from-[#E2136E]/10 to-[#E2136E]/5 border border-[#E2136E]/20 p-6 mb-6">
                  <p className="text-xs font-semibold text-[#E2136E] uppercase tracking-wider mb-2">bKash Send Money Number</p>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-display text-3xl font-bold text-ink tracking-wide">{BKASH_NUMBER}</p>
                    <button
                      onClick={copyNumber}
                      className="flex items-center gap-1.5 rounded-lg border border-[#E2136E]/30 bg-white px-3 py-2 text-sm font-semibold text-[#E2136E] hover:bg-[#E2136E]/5 transition-colors"
                    >
                      {copied ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                    <Info className="h-3.5 w-3.5 flex-shrink-0" />
                    Use <strong className="text-ink">Send Money</strong> option, not Payment
                  </div>
                </div>

                {/* Step-by-step */}
                <div className="space-y-4 mb-6">
                  {[
                    {
                      n: 'A',
                      title: 'Open bKash and tap "Send Money"',
                      body: `Enter the number: ${BKASH_NUMBER}`,
                    },
                    {
                      n: 'B',
                      title: `Enter amount, minimum ৳${MIN_AMOUNT}`,
                      body: `৳${MIN_AMOUNT} = 1 DaaB (coconut reward for one blood donor. Every ৳${MIN_AMOUNT} you send = one hero rewarded.)`,
                    },
                    {
                      n: 'C',
                      title: 'Write "Bloodline" in the Reference field',
                      body: 'This is required so we can match your payment to your registration.',
                    },
                    {
                      n: 'D',
                      title: 'Confirm and note your Transaction ID',
                      body: 'bKash will show a transaction reference. Copy it, you\'ll need it in Step 2.',
                    },
                  ].map(({ n, title, body }) => (
                    <div key={n} className="flex gap-3">
                      <div className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-blood-50 text-crimson font-bold text-xs mt-0.5">
                        {n}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-ink">{title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{body}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg bg-gold-pale border border-amber-200 px-4 py-3 flex items-start gap-2.5 text-sm text-amber-800 mb-6">
                  <Award className="h-4 w-4 flex-shrink-0 mt-0.5 text-gold" />
                  <span>
                    <strong>Important:</strong> The reference field must say <strong>"Bloodline"</strong>. Without it, your payment cannot be verified.
                  </span>
                </div>

                <button onClick={() => setStep(2)} className="btn-primary w-full">
                  I've sent the money, Register Now <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* STEP 2, Registration form */}
            {step === 2 && (
              <div className="card p-7 shadow-hover">
                <h2 className="font-display text-xl font-bold text-ink mb-2 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-crimson text-white text-sm font-bold">2</span>
                  Register Your Donation
                </h2>
                <p className="text-sm text-gray-500 mb-5 ml-10">
                  This makes your contribution public and transparent on the Donor Wall.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Full Name <span className="text-crimson">*</span></label>
                      <input className="input" placeholder="Your name (shown publicly)" value={form.name} onChange={e => update('name', e.target.value)} required />
                    </div>
                    <div>
                      <label className="label">Profession (optional)</label>
                      <input className="input" placeholder="e.g. Engineer, Teacher" value={form.profession} onChange={e => update('profession', e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label className="label">bKash Number Used to Send <span className="text-crimson">*</span></label>
                    <input className="input" placeholder="01XXXXXXXXX" value={form.bkashNumber} onChange={e => update('bkashNumber', e.target.value)} required />
                    <p className="text-xs text-gray-400 mt-1">Must match the number you sent from, for verification.</p>
                  </div>

                  <div>
                    <label className="label">Amount Sent (BDT) <span className="text-crimson">*</span></label>
                    <input type="number" min={MIN_AMOUNT} step="10" className="input" placeholder={`Min ৳${MIN_AMOUNT}`} value={form.amount} onChange={e => update('amount', e.target.value)} required />
                    {coconutsFromAmount > 0 && (
                      <p className="text-xs text-emerald-600 mt-1 font-medium">
                        Your donation will fund <strong>{coconutsFromAmount} coconut reward{coconutsFromAmount > 1 ? 's' : ''}</strong> for blood donors!
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="label">bKash Transaction Reference (optional)</label>
                    <input className="input font-mono" placeholder="e.g. 8CKN6XQ..." value={form.txReference} onChange={e => update('txReference', e.target.value)} />
                    <p className="text-xs text-gray-400 mt-1">Helps admin verify faster. Find it in your bKash transaction history.</p>
                  </div>

                  <div>
                    <label className="label">Message (optional)</label>
                    <textarea className="input resize-none" rows={2} placeholder="A message of support to share with the community..." value={form.message} onChange={e => update('message', e.target.value)} maxLength={300} />
                  </div>

                  <div className="flex items-start gap-2.5 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-xs text-blue-700">
                    <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>
                      Your name, profession, and amount will appear on the public <strong>Donor Wall</strong> after admin verification. Your phone number is never shown publicly.
                    </span>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={() => setStep(1)} className="btn-outline flex-1">← Back</button>
                    <button type="submit" disabled={submitting} className="btn-primary flex-1">
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Submitting...
                        </span>
                      ) : (
                        <><Heart className="h-4 w-4" /> Submit Registration</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* RIGHT, sidebar */}
          <div className="lg:col-span-2 space-y-5">

            {/* Coconut math */}
            <div className="card p-6 border-l-4 border-gold">
              <div className="flex items-center gap-2 mb-3">
                <Award className="h-5 w-5 text-gold" />
                <h3 className="font-display font-bold text-ink">What Your Money Does</h3>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  ['৳ 120',  '1 DaaB reward, thanks one blood donor'],
                  ['৳ 240',  '2 donors rewarded, two lives connected'],
                  ['৳ 600',  '5 donors rewarded, a whole community touched'],
                  ['৳ 1,200','10 donors rewarded, a month of impact'],
                ].map(([amount, desc]) => (
                  <div key={amount} className="flex items-start gap-2.5">
                    <span className="font-bold text-crimson w-16 flex-shrink-0">{amount}</span>
                    <span className="text-gray-600">{desc}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-4">
                DaaB (ডাব) = fresh coconut, a symbol of care in Bangladeshi culture. One coconut = one heartfelt thank-you.
              </p>
            </div>

            {/* Recent donors */}
            {recentDonors.length > 0 && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-ink">Recent Supporters</h3>
                  <Link href="/donors-wall" className="text-xs text-crimson font-medium hover:underline">
                    View all →
                  </Link>
                </div>
                <div className="space-y-3">
                  {recentDonors.map((d: any) => (
                    <div key={d.id} className="flex items-start gap-3">
                      <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-blood-50 text-crimson font-bold text-sm">
                        {d.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-1">
                          <p className="text-sm font-semibold text-ink truncate">{d.name}</p>
                          <p className="text-xs font-bold text-crimson flex-shrink-0">৳{Number(d.amount).toLocaleString()}</p>
                        </div>
                        {d.profession && <p className="text-xs text-gray-400">{d.profession}</p>}
                        {d.message && <p className="text-xs text-gray-500 italic mt-0.5">"{d.message.slice(0, 60)}{d.message.length > 60 ? '...' : ''}"</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ */}
            <div className="card p-6">
              <h3 className="font-display font-bold text-ink mb-4">Common Questions</h3>
              <div className="space-y-2">
                {[
                  {
                    q: 'Is there a maximum donation?',
                    a: 'No maximum. Every taka above ৳120 funds additional coconut rewards for blood donors.',
                  },
                  {
                    q: 'When will I appear on the Donor Wall?',
                    a: 'Within 24–48 hours after admin verifies your bKash transaction.',
                  },
                  {
                    q: 'What if I want to stay anonymous?',
                    a: 'Contact us after registering and we can hide your entry from the public wall.',
                  },
                  {
                    q: 'How is the money used?',
                    a: 'Funds go directly to bKash rewards for verified blood donors and platform operating costs.',
                  },
                ].map(({ q, a }, i) => (
                  <div key={i} className="border-b border-gray-100 last:border-0">
                    <button
                      onClick={() => setShowFaq(showFaq === i ? null : i)}
                      className="flex w-full items-center justify-between py-3 text-left text-sm font-medium text-ink hover:text-crimson transition-colors"
                    >
                      {q}
                      {showFaq === i ? <ChevronUp className="h-4 w-4 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 flex-shrink-0" />}
                    </button>
                    {showFaq === i && (
                      <p className="pb-3 text-xs text-gray-500 leading-relaxed">{a}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
