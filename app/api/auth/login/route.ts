import { NextRequest, NextResponse } from 'next/server'
import { sign } from 'jsonwebtoken'

interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'user' | 'reviewer' | 'auditor'
  permissions: string[]
  mfa_enabled: boolean
  last_login: string
  failed_attempts: number
  locked_until?: string
}

interface LoginRequest {
  username: string
  password: string
  mfa_code?: string
  remember_me?: boolean
}

// In-memory user storage (in production, this would be a database)
const users: Map<string, User> = new Map()
const sessions: Map<string, any> = new Map()

// Initialize with demo users
users.set('admin', {
  id: 'admin-001',
  username: 'admin',
  email: 'admin@zeropoint.protocol',
  role: 'admin',
  permissions: ['read', 'write', 'delete', 'admin', 'audit'],
  mfa_enabled: true,
  last_login: new Date().toISOString(),
  failed_attempts: 0
})

users.set('reviewer', {
  id: 'reviewer-001',
  username: 'reviewer',
  email: 'reviewer@zeropoint.protocol',
  role: 'reviewer',
  permissions: ['read', 'write', 'consensus_vote'],
  mfa_enabled: false,
  last_login: new Date().toISOString(),
  failed_attempts: 0
})

users.set('auditor', {
  id: 'auditor-001',
  username: 'auditor',
  email: 'auditor@zeropoint.protocol',
  role: 'auditor',
  permissions: ['read', 'audit', 'export'],
  mfa_enabled: true,
  last_login: new Date().toISOString(),
  failed_attempts: 0
})

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    const { username, password, mfa_code, remember_me } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: username and password' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = users.get(username)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if account is locked
    if (user.locked_until && new Date() < new Date(user.locked_until)) {
      return NextResponse.json(
        { error: 'Account temporarily locked due to failed attempts' },
        { status: 423 }
      )
    }

    // Simple password validation (in production, use proper hashing)
    if (password !== 'password123') {
      user.failed_attempts++
      
      // Lock account after 5 failed attempts
      if (user.failed_attempts >= 5) {
        user.locked_until = new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
      }
      
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // MFA validation if enabled
    if (user.mfa_enabled && !mfa_code) {
      return NextResponse.json(
        { error: 'MFA code required', requires_mfa: true },
        { status: 401 }
      )
    }

    if (user.mfa_enabled && mfa_code) {
      // Simple MFA validation (in production, use proper TOTP)
      if (mfa_code !== '123456') {
        return NextResponse.json(
          { error: 'Invalid MFA code' },
          { status: 401 }
        )
      }
    }

    // Reset failed attempts on successful login
    user.failed_attempts = 0
    user.locked_until = undefined
    user.last_login = new Date().toISOString()

    // Generate JWT token
    const token = sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
        permissions: user.permissions
      },
      process.env.JWT_SECRET || 'zeropoint-secret-key',
      { expiresIn: remember_me ? '7d' : '24h' }
    )

    // Create session
    const sessionId = `sess-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const session = {
      id: sessionId,
      userId: user.id,
      username: user.username,
      role: user.role,
      permissions: user.permissions,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + (remember_me ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)),
      ip_address: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown'
    }

    sessions.set(sessionId, session)

    // Log successful login
    console.log(`[AUTH] User ${username} logged in successfully from ${session.ip_address}`)

    return NextResponse.json({
      success: true,
      token,
      session_id: sessionId,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        mfa_enabled: user.mfa_enabled
      },
      expires_at: session.expires_at
    }, {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'content-disposition': 'inline',
        'access-control-allow-origin': '*'
      }
    })
  } catch (error) {
    console.error('[AUTH] Login error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
