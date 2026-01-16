import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as Sentry from '@sentry/nextjs'
import { hashPassword, validateAuthInput } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, username, password } = body

    // Validate input
    const validation = validateAuthInput({ email, username, password }, true)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already registered', details: { email: 'This email is already in use' } },
        { status: 409 }
      )
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    })

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username taken', details: { username: 'This username is already in use' } },
        { status: 409 }
      )
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      {
        message: 'Signup successful',
        user,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error during signup:', error)
    Sentry.captureException(error, {
      tags: {
        endpoint: '/api/auth/signup',
        method: 'POST',
      },
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
