import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const schema = z.object({
  name:     z.string().min(2).max(80),
  email:    z.string().email(),
  phone:    z.string().regex(/^01[0-9]{9}$/),
  password: z.string().min(8).max(128),
  district: z.string().min(1).max(60),
  area:     z.string().min(1).max(100),
})

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { name, email, phone, password, district, area } = parsed.data

    // Check phone uniqueness
    const { data: existingPhone } = await supabase
      .from('User')
      .select('id')
      .eq('phone', phone)
      .maybeSingle()

    if (existingPhone) {
      return NextResponse.json({ error: 'Phone number is already registered.' }, { status: 409 })
    }

    // Create Supabase Auth user (admin.createUser bypasses email confirmation)
    const { data, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'RECIPIENT', name, phone },
    })

    if (signUpError) {
      const msg = signUpError.message.toLowerCase()
      if (
        (signUpError as any).code === 'email_exists' ||
        msg.includes('already registered') || msg.includes('already exists') || msg.includes('duplicate')
      ) {
        return NextResponse.json({ error: 'Email is already registered.' }, { status: 409 })
      }
      console.error('[RECIPIENT_REGISTER signUp]', signUpError)
      return NextResponse.json({ error: 'Registration failed.' }, { status: 400 })
    }

    if (!data.user) {
      return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 400 })
    }

    const userId = data.user.id

    // Insert into User table
    const now = new Date().toISOString()
    const { error: userError } = await supabase
      .from('User')
      .insert([{ id: userId, name, email, phone, role: 'RECIPIENT', passwordHash: '', updatedAt: now }])

    if (userError) {
      console.error('[RECIPIENT_REGISTER user insert]', userError)
      return NextResponse.json({ error: 'Failed to create user record.' }, { status: 500 })
    }

    // Insert RecipientProfile
    const { error: profileError } = await supabase
      .from('RecipientProfile')
      .insert([{
        id:        crypto.randomUUID(),
        userId,
        district,
        area,
        updatedAt: now,
      }])

    if (profileError) {
      console.error('[RECIPIENT_REGISTER profile insert]', profileError)
      return NextResponse.json({ error: 'Failed to create recipient profile.' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('[RECIPIENT_REGISTER]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
