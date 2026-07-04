import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BLOOD_GROUP_MAP: Record<string, string> = {
  'A+':  'A_POS', 'A-':  'A_NEG',
  'B+':  'B_POS', 'B-':  'B_NEG',
  'AB+': 'AB_POS','AB-': 'AB_NEG',
  'O+':  'O_POS', 'O-':  'O_NEG',
}

const VALID_BLOOD_GROUPS = new Set(Object.values(BLOOD_GROUP_MAP))

const schema = z.object({
  name:        z.string().min(2).max(80),
  email:       z.string().email(),
  phone:       z.string().regex(/^01[0-9]{9}$/),
  password:    z.string().min(8).max(128),
  bloodGroup:  z.string().min(1),
  district:    z.string().min(1).max(60),
  area:        z.string().min(1).max(100),
  gender:      z.string().nullable().optional(),
  bkashNumber: z.string().regex(/^01[0-9]{9}$/),
})

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { name, email, phone, password, bloodGroup: rawBloodGroup, district, area, gender, bkashNumber } = parsed.data

    const bloodGroup = BLOOD_GROUP_MAP[rawBloodGroup] ?? rawBloodGroup
    if (!VALID_BLOOD_GROUPS.has(bloodGroup)) {
      return NextResponse.json({ error: 'Invalid blood group.' }, { status: 400 })
    }

    // Check phone uniqueness (email uniqueness is handled by Supabase Auth)
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
      user_metadata: { role: 'DONOR', name, phone },
    })

    if (signUpError) {
      const msg = signUpError.message.toLowerCase()
      if (
        (signUpError as any).code === 'email_exists' ||
        msg.includes('already registered') || msg.includes('already exists') || msg.includes('duplicate')
      ) {
        return NextResponse.json({ error: 'Email is already registered.' }, { status: 409 })
      }
      console.error('[DONOR_REGISTER signUp]', signUpError)
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
      .insert([{ id: userId, name, email, phone, role: 'DONOR', passwordHash: '', updatedAt: now }])

    if (userError) {
      console.error('[DONOR_REGISTER user insert]', userError)
      return NextResponse.json({ error: 'Failed to create user record.' }, { status: 500 })
    }

    // Insert DonorProfile
    const { error: donorError } = await supabase
      .from('DonorProfile')
      .insert([{
        id:          crypto.randomUUID(),
        userId,
        bloodGroup,
        district,
        area,
        bkashNumber,
        gender:      gender ?? null,
        updatedAt:   now,
      }])

    if (donorError) {
      console.error('[DONOR_REGISTER profile insert]', donorError)
      return NextResponse.json({ error: 'Failed to create donor profile.' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('[DONOR_REGISTER]', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
