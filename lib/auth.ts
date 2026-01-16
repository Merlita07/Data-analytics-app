/**
 * Password Validation Rules
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character (!@#$%^&*)
 */
export const PASSWORD_RULES = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
}

export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Validate password against security rules
 * Can be used on both client and server side
 */
export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = []

  if (password.length < PASSWORD_RULES.minLength) {
    errors.push(`Password must be at least ${PASSWORD_RULES.minLength} characters long`)
  }

  if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least 1 uppercase letter')
  }

  if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least 1 lowercase letter')
  }

  if (PASSWORD_RULES.requireNumber && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least 1 number')
  }

  if (PASSWORD_RULES.requireSpecial && !/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least 1 special character (!@#$%^&*)')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Server-side only imports
let hashFunc: typeof import('bcryptjs').hash
let compareFunc: typeof import('bcryptjs').compare

// Lazy load bcryptjs only on server
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const bcryptjs = await import('bcryptjs')
    const saltRounds = 10
    return await bcryptjs.hash(password, saltRounds)
  } catch (error) {
    throw new Error('Password hashing failed')
  }
}

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  try {
    const bcryptjs = await import('bcryptjs')
    return await bcryptjs.compare(password, hashedPassword)
  } catch (error) {
    return false
  }
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateUsername = (username: string): { isValid: boolean; error?: string } => {
  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' }
  }
  if (username.length > 20) {
    return { isValid: false, error: 'Username must be at most 20 characters' }
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, underscore, and dash' }
  }
  return { isValid: true }
}

export interface AuthCredentials {
  email: string
  username?: string
  password: string
}

export const validateAuthInput = (input: AuthCredentials, isSignup: boolean = false) => {
  const errors: Record<string, string> = {}

  // Email validation
  if (!input.email) {
    errors.email = 'Email is required'
  } else if (!validateEmail(input.email)) {
    errors.email = 'Invalid email format'
  }

  // Username validation (signup only)
  if (isSignup) {
    if (!input.username) {
      errors.username = 'Username is required'
    } else {
      const usernameValidation = validateUsername(input.username)
      if (!usernameValidation.isValid) {
        errors.username = usernameValidation.error!
      }
    }
  }

  // Password validation
  if (!input.password) {
    errors.password = 'Password is required'
  } else {
    const passwordValidation = validatePassword(input.password)
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors[0]
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
