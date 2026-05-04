import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getUserById, getSessionByToken, setUserRole } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const COOKIE_NAME = 'adgena_session';
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',').map(e => e.trim().toLowerCase()).filter(Boolean);

/**
 * Create JWT token for a user session
 */
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

/**
 * Verify JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Get current user from request cookies (for server components / API routes)
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);
    if (!sessionCookie?.value) return null;

    const decoded = verifyToken(sessionCookie.value);
    if (!decoded?.userId) return null;

    const user = getUserById(decoded.userId);
    if (!user) return null;

    // Auto-set admin role if email is in ADMIN_EMAILS
    let role = user.role || 'user';
    if (ADMIN_EMAILS.includes(user.email?.toLowerCase()) && role !== 'admin') {
      setUserRole(user.id, 'admin');
      role = 'admin';
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role,
      plan: user.plan,
      generations_used: user.generations_used,
      generations_limit: user.generations_limit,
      onboarded: !!user.onboarded,
      created_at: user.created_at,
    };
  } catch {
    return null;
  }
}

/**
 * Set session cookie in response
 */
export function buildSessionCookie(token) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  };
}

/**
 * Cookie name export for logout
 */
export { COOKIE_NAME };
