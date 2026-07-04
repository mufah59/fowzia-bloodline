import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { z } from 'zod'

const schema = z.object({
  name:    z.string().min(2).max(100),
  email:   z.string().email(),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(2000),
})

export async function POST(req: Request) {
  try {
    const body   = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 })
    }

    const { name, email, subject, message } = parsed.data

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })

    await transporter.sendMail({
      from:    `"Fowzia Bloodline Contact" <${process.env.GMAIL_USER}>`,
      to:      'mdminhaz.uddin059@gmail.com',
      replyTo: email,
      subject: `[Fowzia Bloodline] ${subject}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#7C0902;">New Contact Form Submission</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px;font-weight:bold;color:#374151;">Name</td><td style="padding:8px;">${name}</td></tr>
            <tr style="background:#f9fafb;"><td style="padding:8px;font-weight:bold;color:#374151;">Email</td><td style="padding:8px;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding:8px;font-weight:bold;color:#374151;">Subject</td><td style="padding:8px;">${subject}</td></tr>
          </table>
          <div style="margin-top:16px;padding:16px;background:#f9fafb;border-radius:8px;">
            <p style="font-weight:bold;color:#374151;margin:0 0 8px;">Message</p>
            <p style="white-space:pre-wrap;color:#4b5563;margin:0;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
          </div>
          <p style="color:#9ca3af;font-size:12px;margin-top:24px;">Sent from fowziabloodline.com contact form</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[contact]', err)
    return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 })
  }
}
