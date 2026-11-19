import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export interface DbUser {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: 'Admin' | 'User';
  status: 'Active' | 'Inactive';
  createdAt: string;
  lastLogin: string;
  projectsCount?: number;
}

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf-8');
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim();
          process.env[key] = val;
        }
      }
    } catch {}
  }
}
loadEnvFile();

const getJwtSecret = () => process.env.AUTH_SECRET || 'codeforge-super-secure-jwt-secret-key-2026-v2';
export const getAdminSetupSecret = (): string => process.env.ADMIN_SETUP_SECRET || 'CodeForgeAdmin2026!';
export const ADMIN_SETUP_SECRET = getAdminSetupSecret();

function getWritableDataDir(): string {
  if (process.env.DATA_DIR) return process.env.DATA_DIR;
  // In serverless environments (Vercel, Netlify, AWS Lambda), only /tmp is writable
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY) {
    return path.join('/tmp', 'codeforge-data');
  }
  return path.resolve(process.cwd(), 'server', 'data');
}

const DATA_DIR = getWritableDataDir();
const DB_FILE = path.join(DATA_DIR, 'users.json');

// In-memory cache to guarantee zero-crash resilience in serverless / read-only filesystems
let inMemoryUsers: DbUser[] | null = null;

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err: any) {
    console.warn('[CodeForge DB] Notice: Filesystem read-only, operating with in-memory persistence fallback:', err.message);
  }
}

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

export function verifyPassword(password: string, salt: string, hash: string): boolean {
  const testHash = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(testHash, 'hex'), Buffer.from(hash, 'hex'));
}

export function generateToken(user: DbUser, rememberMe = true): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const exp = now + (rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60); // 30 days or 24 hours

  const payload = Buffer.from(JSON.stringify({
    sub: user.id,
    email: user.email.toLowerCase(),
    role: user.role,
    name: user.fullName,
    iat: now,
    exp
  })).toString('base64url');

  const signature = crypto
    .createHmac('sha256', getJwtSecret())
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

export function verifyToken(token: string): { sub: string; email: string; role: 'Admin' | 'User'; name: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;

    const expectedSignature = crypto
      .createHmac('sha256', getJwtSecret())
      .update(`${header}.${payload}`)
      .digest('base64url');

    if (expectedSignature !== signature) return null;

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) return null;

    return decoded;
  } catch {
    return null;
  }
}

function loadUsers(): DbUser[] {
  if (inMemoryUsers !== null && inMemoryUsers.length > 0) {
    return inMemoryUsers;
  }
  ensureDataDir();
  if (!fs.existsSync(DB_FILE)) {
    inMemoryUsers = inMemoryUsers || [];
    return inMemoryUsers;
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    inMemoryUsers = JSON.parse(data);
    return inMemoryUsers || [];
  } catch (err: any) {
    console.warn('[CodeForge DB] Read error, falling back to memory cache:', err.message);
    return inMemoryUsers || [];
  }
}

function saveUsers(users: DbUser[]) {
  inMemoryUsers = [...users];
  try {
    ensureDataDir();
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(users, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err: any) {
    console.warn('[CodeForge DB] Disk write skipped (serverless/read-only), persisted in memory:', err.message);
  }
}

export function initAuthDb() {
  ensureDataDir();
  let users = loadUsers();

  let modified = false;

  // 1. Seed Default Administrator if not present
  const adminExists = users.some(u => u.email.toLowerCase() === 'admin@codeforge.dev');
  if (!adminExists) {
    const salt = crypto.randomBytes(16).toString('hex');
    const adminUser: DbUser = {
      id: 'usr_admin_001',
      fullName: 'System Administrator',
      email: 'admin@codeforge.dev',
      passwordHash: hashPassword('Admin@CodeForge2026!', salt),
      salt,
      role: 'Admin',
      status: 'Active',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      projectsCount: 5
    };
    users.push(adminUser);
    modified = true;
    console.log('[Auth DB] Seeded default administrator: admin@codeforge.dev');
  }

  // 2. Seed Sample User if not present
  const demoUserExists = users.some(u => u.email.toLowerCase() === 'user@codeforge.dev');
  if (!demoUserExists) {
    const salt = crypto.randomBytes(16).toString('hex');
    const demoUser: DbUser = {
      id: 'usr_dev_002',
      fullName: 'Alex Rivera',
      email: 'user@codeforge.dev',
      passwordHash: hashPassword('User@CodeForge2026!', salt),
      salt,
      role: 'User',
      status: 'Active',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      projectsCount: 3
    };
    users.push(demoUser);
    modified = true;
    console.log('[Auth DB] Seeded demo user: user@codeforge.dev');
  }

  if (modified) {
    saveUsers(users);
  }
}

export function findUserByEmail(email: string): DbUser | undefined {
  const users = loadUsers();
  return users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
}

export function findUserById(id: string): DbUser | undefined {
  const users = loadUsers();
  return users.find(u => u.id === id);
}

export function createUser(
  fullName: string, 
  email: string, 
  password: string, 
  role: 'Admin' | 'User',
  status: 'Active' | 'Inactive' = 'Active'
): DbUser {
  const users = loadUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
    throw new Error('An account with this email address already exists.');
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const newUser: DbUser = {
    id: `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    fullName: fullName.trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(password, salt),
    salt,
    role,
    status,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    projectsCount: 1
  };

  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function updateUser(id: string, updates: Partial<DbUser>): DbUser | null {
  const users = loadUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return null;

  const current = users[index];
  users[index] = {
    ...current,
    ...updates,
    id: current.id, // prevent ID change
  };

  saveUsers(users);
  return users[index];
}

export function deleteUser(id: string): boolean {
  const users = loadUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return false;

  // Prevent deleting the initial root admin
  if (users[index].email.toLowerCase() === 'admin@codeforge.dev') {
    throw new Error('Cannot delete primary system administrator account.');
  }

  users.splice(index, 1);
  saveUsers(users);
  return true;
}

export function getAllUsers(): Omit<DbUser, 'passwordHash' | 'salt'>[] {
  const users = loadUsers();
  return users.map(u => sanitizeUser(u));
}

export function sanitizeUser(user: DbUser): Omit<DbUser, 'passwordHash' | 'salt'> {
  const { passwordHash, salt, ...safeUser } = user;
  return safeUser;
}

export function getPlatformStats() {
  const users = loadUsers();
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'Active').length;
  const adminUsers = users.filter(u => u.role === 'Admin').length;
  const regularUsers = users.filter(u => u.role === 'User').length;
  const totalProjects = users.reduce((acc, u) => acc + (u.projectsCount || 0), 12);

  return {
    totalUsers,
    activeUsers,
    inactiveUsers: totalUsers - activeUsers,
    adminUsers,
    regularUsers,
    totalProjects,
    totalExecutions: 1420,
    serverUptime: '99.98%',
    systemHealth: 'Optimal'
  };
}
