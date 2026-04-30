/**
 * SQLite Database Layer
 * Users, generations, projects
 */

import Database from 'better-sqlite3';
import path from 'path';
import crypto from 'crypto';
import bcryptjs from 'bcryptjs';

// In production (Railway), use absolute volume path /app/data
// Locally, use ./data relative to project root
const DATA_DIR = process.env.NODE_ENV === 'production'
  ? '/app/data'
  : path.join(process.cwd(), 'data');

const DB_PATH = path.join(DATA_DIR, 'adgena.db');

let db = null;

function getDb() {
  if (!db) {
    // Ensure data directory exists
    const fs = require('fs');
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initTables();
  }
  return db;
}

function initTables() {
  const d = getDb();

  d.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT DEFAULT '',
      role TEXT DEFAULT 'user',
      plan TEXT DEFAULT 'free',
      generations_used INTEGER DEFAULT 0,
      generations_limit INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS generations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'marketplace',
      template_id TEXT,
      size_id TEXT,
      product_name TEXT,
      product_desc TEXT,
      generated_text TEXT,
      image_input_path TEXT,
      image_output_path TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      status TEXT DEFAULT 'open',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS ticket_messages (
      id TEXT PRIMARY KEY,
      ticket_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      message TEXT NOT NULL,
      is_staff INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (ticket_id) REFERENCES tickets(id),
      FOREIGN KEY (sender_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_generations_user ON generations(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_id);
    CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);

    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      plan TEXT NOT NULL,
      amount REAL NOT NULL,
      initial_inv_id TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      next_charge_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      inv_id TEXT,
      plan TEXT,
      amount REAL,
      is_recurring INTEGER DEFAULT 0,
      status TEXT DEFAULT 'completed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS consents (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_email TEXT NOT NULL,
      plan TEXT NOT NULL,
      consent_text TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
    CREATE INDEX IF NOT EXISTS idx_consents_user ON consents(user_id);
  `);

  // Migrate: add role column if missing
  try { d.prepare("SELECT role FROM users LIMIT 1").get(); }
  catch { d.exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'"); }

  // Migrate: add subscription columns if missing
  try { d.prepare("SELECT subscription_plan FROM users LIMIT 1").get(); }
  catch { d.exec("ALTER TABLE users ADD COLUMN subscription_plan TEXT DEFAULT NULL"); }

  try { d.prepare("SELECT subscription_inv_id FROM users LIMIT 1").get(); }
  catch { d.exec("ALTER TABLE users ADD COLUMN subscription_inv_id TEXT DEFAULT NULL"); }
}

// ========================================
// USERS
// ========================================

export function createUser({ email, password, name }) {
  const d = getDb();
  const id = crypto.randomUUID();
  const passwordHash = bcryptjs.hashSync(password, 10);

  const stmt = d.prepare(`
    INSERT INTO users (id, email, password_hash, name)
    VALUES (?, ?, ?, ?)
  `);

  try {
    stmt.run(id, email.toLowerCase().trim(), passwordHash, name || '');
    return { id, email, name: name || '', plan: 'free', generationsUsed: 0, generationsLimit: 1 };
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      throw new Error('Email уже зарегистрирован');
    }
    throw err;
  }
}

export function getUserByEmail(email) {
  const d = getDb();
  return d.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
}

export function getUserById(id) {
  const d = getDb();
  return d.prepare('SELECT id, email, name, role, plan, generations_used, generations_limit, created_at FROM users WHERE id = ?').get(id);
}

export function verifyPassword(plainPassword, hash) {
  return bcryptjs.compareSync(plainPassword, hash);
}

export function updateUserPlan(userId, plan) {
  const d = getDb();
  const limits = { free: 1, lite: 10, standard: 30, pro: 80, business: 200 };
  d.prepare('UPDATE users SET plan = ?, generations_limit = ?, updated_at = datetime(\'now\') WHERE id = ?')
    .run(plan, limits[plan] || 5, userId);
}

export function incrementGenerations(userId) {
  const d = getDb();
  d.prepare('UPDATE users SET generations_used = generations_used + 1, updated_at = datetime(\'now\') WHERE id = ?')
    .run(userId);
}

export function resetMonthlyGenerations() {
  const d = getDb();
  d.prepare('UPDATE users SET generations_used = 0, updated_at = datetime(\'now\')').run();
}

export function canGenerate(userId) {
  const user = getUserById(userId);
  if (!user) return false;
  return user.generations_used < user.generations_limit;
}

export function setUserRole(userId, role) {
  const d = getDb();
  d.prepare("UPDATE users SET role = ?, updated_at = datetime('now') WHERE id = ?").run(role, userId);
}

// ========================================
// SESSIONS
// ========================================

export function createSession(userId) {
  const d = getDb();
  const id = crypto.randomUUID();
  const token = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

  d.prepare('INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)')
    .run(id, userId, token, expiresAt);

  return { token, expiresAt };
}

export function getSessionByToken(token) {
  const d = getDb();
  const session = d.prepare('SELECT * FROM sessions WHERE token = ? AND expires_at > datetime(\'now\')').get(token);
  return session;
}

export function deleteSession(token) {
  const d = getDb();
  d.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

// ========================================
// GENERATIONS
// ========================================

export function createGeneration({ userId, type, templateId, sizeId, productName, productDesc, generatedText, imageInputPath }) {
  const d = getDb();
  const id = crypto.randomUUID();

  d.prepare(`
    INSERT INTO generations (id, user_id, type, template_id, size_id, product_name, product_desc, generated_text, image_input_path, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'processing')
  `).run(id, userId, type, templateId, sizeId, productName, productDesc, generatedText ? JSON.stringify(generatedText) : null, imageInputPath);

  return id;
}

export function updateGeneration(id, { status, imageOutputPath }) {
  const d = getDb();
  const sets = [];
  const vals = [];

  if (status) { sets.push('status = ?'); vals.push(status); }
  if (imageOutputPath) { sets.push('image_output_path = ?'); vals.push(imageOutputPath); }

  if (sets.length === 0) return;
  vals.push(id);

  d.prepare(`UPDATE generations SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
}

export function getGenerationsByUser(userId, limit = 20) {
  const d = getDb();
  return d.prepare('SELECT * FROM generations WHERE user_id = ? ORDER BY created_at DESC LIMIT ?').all(userId, limit);
}

export function getGenerationById(id) {
  const d = getDb();
  return d.prepare('SELECT * FROM generations WHERE id = ?').get(id);
}

// ========================================
// TICKETS
// ========================================

export function createTicket(userId, subject, message) {
  const d = getDb();
  const ticketId = crypto.randomUUID();
  const msgId = crypto.randomUUID();

  d.prepare('INSERT INTO tickets (id, user_id, subject) VALUES (?, ?, ?)').run(ticketId, userId, subject);
  d.prepare('INSERT INTO ticket_messages (id, ticket_id, sender_id, message, is_staff) VALUES (?, ?, ?, ?, 0)').run(msgId, ticketId, userId, message);

  return ticketId;
}

export function addTicketMessage(ticketId, senderId, message, isStaff = false) {
  const d = getDb();
  const id = crypto.randomUUID();
  d.prepare('INSERT INTO ticket_messages (id, ticket_id, sender_id, message, is_staff) VALUES (?, ?, ?, ?, ?)').run(id, ticketId, senderId, message, isStaff ? 1 : 0);
  d.prepare("UPDATE tickets SET updated_at = datetime('now') WHERE id = ?").run(ticketId);
  return id;
}

export function getTicketsByUser(userId) {
  const d = getDb();
  return d.prepare('SELECT * FROM tickets WHERE user_id = ? ORDER BY updated_at DESC').all(userId);
}

export function getAllTickets(status = null) {
  const d = getDb();
  if (status) {
    return d.prepare('SELECT t.*, u.email, u.name FROM tickets t JOIN users u ON t.user_id = u.id WHERE t.status = ? ORDER BY t.updated_at DESC').all(status);
  }
  return d.prepare('SELECT t.*, u.email, u.name FROM tickets t JOIN users u ON t.user_id = u.id ORDER BY t.updated_at DESC').all();
}

export function getTicketById(ticketId) {
  const d = getDb();
  const ticket = d.prepare('SELECT t.*, u.email, u.name FROM tickets t JOIN users u ON t.user_id = u.id WHERE t.id = ?').get(ticketId);
  if (!ticket) return null;
  const messages = d.prepare('SELECT tm.*, u.email as sender_email, u.name as sender_name FROM ticket_messages tm JOIN users u ON tm.sender_id = u.id WHERE tm.ticket_id = ? ORDER BY tm.created_at ASC').all(ticketId);
  return { ...ticket, messages };
}

export function updateTicketStatus(ticketId, status) {
  const d = getDb();
  d.prepare("UPDATE tickets SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, ticketId);
}

// ========================================
// ROLES
// ========================================

export function updateUserRole(userId, role) {
  const d = getDb();
  d.prepare("UPDATE users SET role = ?, updated_at = datetime('now') WHERE id = ?").run(role, userId);
}

export function updateUserCredits(userId, newLimit) {
  const d = getDb();
  d.prepare("UPDATE users SET generations_limit = ?, updated_at = datetime('now') WHERE id = ?").run(newLimit, userId);
}

export function isStaff(userId) {
  const user = getUserById(userId);
  if (!user) return false;
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  return user.role === 'admin' || user.role === 'support' || adminEmails.includes(user.email?.toLowerCase());
}

export default getDb;
