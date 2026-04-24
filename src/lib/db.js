/**
 * SQLite Database Layer
 * Users, generations, projects
 */

import Database from 'better-sqlite3';
import path from 'path';
import crypto from 'crypto';
import bcryptjs from 'bcryptjs';

const DB_PATH = path.join(process.cwd(), 'data', 'adgena.db');

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
      plan TEXT DEFAULT 'free',
      generations_used INTEGER DEFAULT 0,
      generations_limit INTEGER DEFAULT 5,
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

    CREATE INDEX IF NOT EXISTS idx_generations_user ON generations(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);
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
    return { id, email, name: name || '', plan: 'free', generationsUsed: 0, generationsLimit: 5 };
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
  return d.prepare('SELECT id, email, name, plan, generations_used, generations_limit, created_at FROM users WHERE id = ?').get(id);
}

export function verifyPassword(plainPassword, hash) {
  return bcryptjs.compareSync(plainPassword, hash);
}

export function updateUserPlan(userId, plan) {
  const d = getDb();
  const limits = { free: 5, starter: 50, pro: 200, business: 500 };
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

export default getDb;
