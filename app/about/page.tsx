import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Heart, Shield, Award, Users, Droplets, CheckCircle2, Mail, Facebook } from 'lucide-react'

export const metadata = { title: 'About Fowzia Bloodline' }

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">

        {/* Hero */}
        <section className="bg-hero text-white py-20">
          <div className="container-site px-4 sm:px-6 lg:px-8 text-center max-w-3xl mx-auto">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
              <Heart className="h-7 w-7 text-white fill-white" />
            </div>
            <h1 className="font-display text-4xl font-bold mb-4">About Fowzia Bloodline</h1>
            <p className="text-lg text-white/80 leading-relaxed">
              An individual endeavour born from a moment of helplessness, and a mother's heart that never stops caring.
            </p>
          </div>
        </section>

        {/* The Founder & The Real Story */}
        <section className="section bg-white">
          <div className="container-site max-w-3xl">

            {/* Founder tag */}
            <div className="inline-flex items-center gap-2 rounded-full bg-blood-50 border border-blood-200 px-4 py-1.5 text-xs font-semibold text-crimson mb-6">
              <Heart className="h-3.5 w-3.5 fill-crimson" /> An Individual Endeavour
            </div>

            <h2 className="section-title mb-6">The Story Behind Fowzia Bloodline</h2>

            <div className="space-y-5 text-gray-600 leading-relaxed">

              <p className="text-lg">
                My name is <strong className="text-ink">Minhaz Fahim</strong>. I have been trying to find blood for people since my school days, connecting donors with those in need through word of mouth, phone calls, and WhatsApp groups. Over the years I became a go-to person for people in my surroundings whenever they needed blood. Friends, family, neighbours, they would call me, and I would try my best.
              </p>

              <p>
                During the <strong className="text-ink">July Revolution</strong>, I collected a large list of blood donor information specifically to help manage blood supply for the injured. I put real effort into building that list, going person to person, documenting names, blood groups, and phone numbers.
              </p>

              {/* The moment, emotionally highlighted */}
              <div className="relative rounded-2xl bg-blood-50 border-l-4 border-crimson p-7 my-8">
                <div className="absolute -top-3 left-6 bg-crimson text-white text-xs font-bold px-3 py-1 rounded-full">
                  The Moment That Changed Everything
                </div>
                <p className="text-gray-700 leading-relaxed mt-2">
                  Recently, my mother <strong className="text-ink">Fowzia</strong> was at <strong className="text-ink">Chittagong Medical College Hospital</strong> for her treatment. While she was there, she witnessed something that broke her heart, a man was crying in the corridor. His wife was on labour and urgently needed <strong className="text-ink">O− blood</strong>. He didn't know where to turn.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  My mother called me immediately. She knew I kept a donor list. She believed I could help that man.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  But I couldn't find the list. The donor information I had collected during the July Revolution, carefully gathered, names and numbers of real willing donors, was somewhere in my files, and I couldn't locate it in that moment when it mattered most.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  I felt terrible. My mother felt terrible. A man was crying outside a labour ward, and I had the information that could have helped him, but I couldn't access it when it counted.
                </p>
              </div>

              <p>
                That moment stayed with me. It made me realise that a donor list sitting in someone's phone or a spreadsheet is not enough. People need a <strong className="text-ink">searchable, always-available, verified network</strong>, not scattered notes that disappear when you need them most.
              </p>

              <p>
                And it is not just that one incident. Because people around me know I try to manage blood, I get calls constantly. Nowadays I genuinely struggle to respond to everyone, I don't always have the right contact, I don't always know who is currently eligible, and I don't have the time to manage it manually anymore.
              </p>

              <p className="text-lg font-medium text-ink">
                That is why I built Fowzia Bloodline.
              </p>

              <p>
                A platform where every willing donor is registered and searchable. Where eligibility is tracked automatically. Where a desperate father at a hospital corridor at midnight can open his phone, type "O−, Chittagong", and find a real, verified, contactable donor within seconds.
              </p>

              <p>
                I named it after my mother, <strong className="text-ink">Fowzia</strong>, because she has always been someone who tries to help people, and she still is. The fact that she was the one who called me that day, trying to connect a stranger in need with her son who she believed could help, captures exactly the spirit this platform is built on.
              </p>

              <p className="text-gray-500 italic">
                This is not a company. It is not a startup. It is one person's answer to a problem they have lived, and a tribute to a mother who never stops trying to help others. Her love and kindness continue to inspire every part of this platform.
              </p>
            </div>

            {/* Founder contact card */}
            <div className="mt-10 rounded-2xl border border-gray-200 bg-surface p-7">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-2xl bg-crimson text-white font-display font-bold text-2xl">
                  M
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl font-bold text-ink">Minhaz Fahim</h3>
                  <p className="text-sm text-gray-500 mt-0.5 mb-4">Founder, Fowzia Bloodline | Individual Endeavour</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href="mailto:minhaz@autolinium.com"
                      className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-ink hover:border-crimson hover:text-crimson transition-colors"
                    >
                      <Mail className="h-4 w-4 text-crimson" />
                      minhaz@autolinium.com
                    </a>
                    <a
                      href="https://www.facebook.com/mufah.me"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-ink hover:border-[#1877F2] hover:text-[#1877F2] transition-colors"
                    >
                      <Facebook className="h-4 w-4 text-[#1877F2]" />
                      facebook.com/mufah.me
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Mission & Values */}
        <section className="section bg-surface">
          <div className="container-site">
            <div className="text-center mb-12">
              <h2 className="section-title">Mission & Values</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Heart,  color: 'bg-blood-50 text-crimson', title: 'Save Lives',       body: 'Every feature is designed around a single goal: getting the right blood to the right person as fast as possible.' },
                { icon: Shield, color: 'bg-trust-pale text-trust', title: 'Build Trust',       body: 'Verified profiles, admin moderation, and privacy safeguards ensure the platform remains safe and reliable.' },
                { icon: Award,  color: 'bg-gold-pale text-gold',   title: 'Celebrate Donors', body: 'Donors are heroes. We celebrate them with reputation scores, rewards, and the gratitude of the families they help.' },
              ].map(({ icon: Icon, color, title, body }) => (
                <div key={title} className="card-hover p-8 text-center">
                  <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${color}`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-ink mb-3">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="section bg-white">
          <div className="container-site max-w-3xl">
            <h2 className="section-title mb-8">How the Platform Works</h2>
            <div className="space-y-6">
              {[
                { step: '1', title: 'Register',           body: 'Create an account as a donor or recipient. Both roles require registration to protect privacy and prevent abuse.' },
                { step: '2', title: 'Complete Profile',   body: 'Donors fill in their blood group, district, bKash number, and upload a profile photo. Admin reviews and marks profiles verified.' },
                { step: '3', title: 'Search & Connect',   body: 'Recipients search by blood group and district. Eligible, verified donors appear first. Requesting contact is protected and rate-limited.' },
                { step: '4', title: 'Donate & Log',       body: 'After donating, donors log the event from their dashboard with date, hospital, and proof image. This goes to admin for review.' },
                { step: '5', title: 'Admin Verification', body: "Admins review each donation proof. Approved events update the donor's eligibility countdown and trigger a bKash reward." },
                { step: '6', title: 'Feedback & Legacy',  body: 'Recipient families leave ratings and thank-you messages. Approved feedback builds donor reputation, a lasting record of impact.' },
              ].map(({ step, title, body }) => (
                <div key={step} className="flex gap-4">
                  <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-crimson text-white font-bold text-sm mt-0.5">
                    {step}
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-ink mb-1">{title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Built by */}
        <section className="section bg-surface">
          <div className="container-site max-w-2xl text-center">
            <h2 className="section-title mb-4">Built by Autolinium</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Fowzia Bloodline was designed and developed by <strong>Autolinium</strong>, a company dedicated to building the backbone of modern businesses through AI automation and intelligent software.
            </p>
            <a
              href="https://autolinium.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Visit Autolinium
            </a>
          </div>
        </section>

        {/* Prayer */}
        <section className="py-16 bg-white">
          <div className="container-site max-w-2xl text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-blood-50">
              <Heart className="h-6 w-6 text-crimson fill-crimson/30" />
            </div>
            <p className="font-display text-lg font-semibold text-ink mb-3">A Note of Gratitude</p>
            <p className="text-gray-500 leading-relaxed text-sm max-w-lg mx-auto">
              I ask everyone who reads this story to keep my mother <strong className="text-ink">Fowzia</strong> and my beloved family in their prayers. May Allah grant her long life, good health, and happiness. May He bless our family with His mercy and keep us together in love. Their support means everything to me, and this platform is as much theirs as it is mine.
            </p>
            <div className="mt-6 text-xs text-gray-400 italic">
              "And your Lord has decreed that you not worship except Him, and to parents, good treatment." (Quran 17:23)
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
