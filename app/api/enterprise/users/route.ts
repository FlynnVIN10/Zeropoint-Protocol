import { NextRequest, NextResponse } from 'next/server'
import { logAuditEvent } from '../../audit/log/route'

interface EnterpriseUser {
  id: string
  username: string
  email: string
  full_name: string
  role: 'admin' | 'user' | 'reviewer' | 'auditor' | 'manager'
  department: string
  permissions: string[]
  mfa_enabled: boolean
  sso_enabled: boolean
  ldap_dn?: string
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  created_at: string
  last_login: string
  failed_attempts: number
  locked_until?: string
  metadata: {
    employee_id?: string
    manager_id?: string
    cost_center?: string
    location?: string
    timezone?: string
  }
}

interface CreateUserRequest {
  username: string
  email: string
  full_name: string
  role: string
  department: string
  permissions: string[]
  mfa_enabled?: boolean
  sso_enabled?: boolean
  ldap_dn?: string
  metadata?: any
}

// In-memory enterprise user storage (in production, this would be a database)
let enterpriseUsers: Map<string, EnterpriseUser> = new Map()
let userCounter = 1

// Initialize with demo enterprise users
enterpriseUsers.set('admin', {
  id: 'emp-001',
  username: 'admin',
  email: 'admin@zeropoint.protocol',
  full_name: 'System Administrator',
  role: 'admin',
  department: 'IT',
  permissions: ['read', 'write', 'delete', 'admin', 'audit', 'user_management'],
  mfa_enabled: true,
  sso_enabled: true,
  status: 'active',
  created_at: new Date().toISOString(),
  last_login: new Date().toISOString(),
  failed_attempts: 0,
  metadata: {
    employee_id: 'EMP001',
    cost_center: 'IT-001',
    location: 'HQ',
    timezone: 'UTC'
  }
})

enterpriseUsers.set('manager', {
  id: 'emp-002',
  username: 'manager',
  email: 'manager@zeropoint.protocol',
  full_name: 'Department Manager',
  role: 'manager',
  department: 'Operations',
  permissions: ['read', 'write', 'consensus_vote', 'team_management'],
  mfa_enabled: true,
  sso_enabled: false,
  status: 'active',
  created_at: new Date().toISOString(),
  last_login: new Date().toISOString(),
  failed_attempts: 0,
  metadata: {
    employee_id: 'EMP002',
    cost_center: 'OPS-001',
    location: 'HQ',
    timezone: 'UTC'
  }
})

export async function POST(request: NextRequest) {
  try {
    const body: CreateUserRequest = await request.json()
    const { 
      username, 
      email, 
      full_name, 
      role, 
      department, 
      permissions, 
      mfa_enabled = false,
      sso_enabled = false,
      ldap_dn,
      metadata = {}
    } = body

    if (!username || !email || !full_name || !role || !department || !permissions) {
      return NextResponse.json(
        { error: 'Missing required fields: username, email, full_name, role, department, permissions' },
        { status: 400 }
      )
    }

    // Check if username already exists
    if (enterpriseUsers.has(username)) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      )
    }

    // Validate role
    const validRoles = ['admin', 'user', 'reviewer', 'auditor', 'manager']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be one of: ' + validRoles.join(', ') },
        { status: 400 }
      )
    }

    const user: EnterpriseUser = {
      id: `emp-${userCounter++}`,
      username,
      email,
      full_name,
      role: role as any,
      department,
      permissions,
      mfa_enabled,
      sso_enabled,
      ldap_dn,
      status: 'pending',
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      failed_attempts: 0,
      metadata
    }

    enterpriseUsers.set(username, user)

    // Log audit event
    logAuditEvent({
      user_id: 'system',
      username: 'system',
      action: 'create_user',
      resource: 'enterprise_user',
      resource_id: user.id,
      details: { username, email, role, department },
      severity: 'medium',
      category: 'authorization',
      compliance_tags: ['user_management', 'compliance']
    })

    return NextResponse.json({
      success: true,
      user_id: user.id,
      message: 'Enterprise user created successfully'
    }, {
      status: 201,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'content-disposition': 'inline',
        'access-control-allow-origin': '*'
      }
    })
  } catch (error) {
    console.error('[ENTERPRISE] Failed to create user:', error)
    return NextResponse.json(
      { error: 'Failed to create enterprise user' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const department = searchParams.get('department')
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '100')
    
    let filteredUsers = Array.from(enterpriseUsers.values())
    
    // Apply filters
    if (department) {
      filteredUsers = filteredUsers.filter(u => u.department === department)
    }
    
    if (role) {
      filteredUsers = filteredUsers.filter(u => u.role === role)
    }
    
    if (status) {
      filteredUsers = filteredUsers.filter(u => u.status === status)
    }
    
    // Sort by creation date (newest first) and limit results
    filteredUsers = filteredUsers
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)

    // Calculate user statistics
    const stats = calculateUserStats(filteredUsers)

    return NextResponse.json({
      users: filteredUsers,
      statistics: stats,
      total_users: enterpriseUsers.size,
      filtered_count: filteredUsers.length
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
    console.error('[ENTERPRISE] Failed to fetch users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch enterprise users' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, updates } = body

    if (!username || !updates) {
      return NextResponse.json(
        { error: 'Missing required fields: username, updates' },
        { status: 400 }
      )
    }

    const user = enterpriseUsers.get(username)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update user fields
    Object.assign(user, updates)
    user.last_login = new Date().toISOString()

    // Log audit event
    logAuditEvent({
      user_id: 'system',
      username: 'system',
      action: 'update_user',
      resource: 'enterprise_user',
      resource_id: user.id,
      details: { username, updates },
      severity: 'medium',
      category: 'authorization',
      compliance_tags: ['user_management', 'compliance']
    })

    return NextResponse.json({
      success: true,
      message: 'Enterprise user updated successfully',
      user_id: user.id
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
    console.error('[ENTERPRISE] Failed to update user:', error)
    return NextResponse.json(
      { error: 'Failed to update enterprise user' },
      { status: 500 }
    )
  }
}

function calculateUserStats(users: EnterpriseUser[]) {
  if (users.length === 0) {
    return {
      total_users: 0,
      role_distribution: {},
      department_distribution: {},
      status_distribution: {},
      mfa_adoption: 0,
      sso_adoption: 0
    }
  }

  const roleDistribution = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const departmentDistribution = users.reduce((acc, u) => {
    acc[u.department] = (acc[u.department] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const statusDistribution = users.reduce((acc, u) => {
    acc[u.status] = (acc[u.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const mfaAdoption = (users.filter(u => u.mfa_enabled).length / users.length) * 100
  const ssoAdoption = (users.filter(u => u.sso_enabled).length / users.length) * 100

  return {
    total_users: users.length,
    role_distribution: roleDistribution,
    department_distribution: departmentDistribution,
    status_distribution: statusDistribution,
    mfa_adoption: Math.round(mfaAdoption * 100) / 100,
    sso_adoption: Math.round(ssoAdoption * 100) / 100
  }
}
