import type { IncomingMessage, ServerResponse } from 'http';
import { 
  initAuthDb, 
  findUserByEmail, 
  findUserById, 
  createUser, 
  updateUser, 
  deleteUser, 
  getAllUsers, 
  getPlatformStats,
  sanitizeUser, 
  verifyPassword, 
  hashPassword,
  generateToken, 
  verifyToken, 
  getAdminSetupSecret,
  ADMIN_SETUP_SECRET,
  DbUser
} from './authDb';
import crypto from 'node:crypto';

// Initialize the database and default admin user on startup
initAuthDb();

function parseJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 512 * 1024) { // 512KB limit
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, data: any) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

function getBearerToken(req: IncomingMessage): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.substring(7).trim();
}

export async function handleAuthRoutes(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = req.url?.split('?')[0] || '';
  const method = req.method;

  // ----------------------------------------------------
  // 1. POST /api/auth/register
  // ----------------------------------------------------
  if (url === '/api/auth/register' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { fullName, email, password, role = 'User', adminSecret, rememberMe = true } = body;

      if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
        sendJson(res, 400, { error: 'Full name is required (minimum 2 characters).' });
        return true;
      }

      if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        sendJson(res, 400, { error: 'A valid email address is required.' });
        return true;
      }

      if (!password || typeof password !== 'string' || password.length < 6) {
        sendJson(res, 400, { error: 'Password must be at least 6 characters long.' });
        return true;
      }

      let assignedRole: 'Admin' | 'User' = 'User';

      // Security Check: Public signups cannot self-elevate to Admin without valid Admin Setup Key
      if (role === 'Admin') {
        const expectedSecret = getAdminSetupSecret();
        if (!adminSecret || adminSecret.trim() !== expectedSecret) {
          sendJson(res, 403, { 
            error: 'Invalid or missing Admin Setup Key. Public registration cannot grant Administrator privileges.' 
          });
          return true;
        }
        assignedRole = 'Admin';
      }

      const existingUser = findUserByEmail(email);
      if (existingUser) {
        sendJson(res, 409, { error: 'An account with this email address already exists.' });
        return true;
      }

      const newUser = createUser(fullName, email, password, assignedRole, 'Active');
      const token = generateToken(newUser, rememberMe);

      sendJson(res, 201, {
        message: 'Account created successfully.',
        token,
        user: sanitizeUser(newUser)
      });
      return true;
    } catch (err: any) {
      sendJson(res, 500, { error: err.message || 'Internal registration error.' });
      return true;
    }
  }

  // ----------------------------------------------------
  // 2. POST /api/auth/login
  // ----------------------------------------------------
  if (url === '/api/auth/login' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { email, password, requestedRole, rememberMe = true } = body;

      if (!email || !password) {
        sendJson(res, 400, { error: 'Email and password are required.' });
        return true;
      }

      const user = findUserByEmail(email);
      if (!user) {
        sendJson(res, 401, { error: 'Invalid email or password.' });
        return true;
      }

      const isMatch = verifyPassword(password, user.salt, user.passwordHash);
      if (!isMatch) {
        sendJson(res, 401, { error: 'Invalid email or password.' });
        return true;
      }

      if (user.status === 'Inactive') {
        sendJson(res, 403, { error: 'This account has been deactivated. Please contact an administrator.' });
        return true;
      }

      // Check role enforcement if the user specifically navigated to the Admin portal
      if (requestedRole === 'Admin' && user.role !== 'Admin') {
        sendJson(res, 403, { 
          error: 'Access Denied: This account does not possess Administrator privileges.' 
        });
        return true;
      }

      // Update last login
      const updatedUser = updateUser(user.id, { lastLogin: new Date().toISOString() }) || user;
      const token = generateToken(updatedUser, rememberMe);

      sendJson(res, 200, {
        message: 'Login successful.',
        token,
        user: sanitizeUser(updatedUser)
      });
      return true;
    } catch (err: any) {
      sendJson(res, 500, { error: err.message || 'Internal authentication error.' });
      return true;
    }
  }

  // ----------------------------------------------------
  // 3. GET /api/auth/me
  // ----------------------------------------------------
  if (url === '/api/auth/me' && method === 'GET') {
    const token = getBearerToken(req);
    if (!token) {
      sendJson(res, 401, { error: 'No authorization token provided.' });
      return true;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      sendJson(res, 401, { error: 'Session expired or invalid token. Please log in again.' });
      return true;
    }

    const user = findUserById(decoded.sub);
    if (!user) {
      sendJson(res, 404, { error: 'User account not found.' });
      return true;
    }

    if (user.status === 'Inactive') {
      sendJson(res, 403, { error: 'Account has been deactivated.' });
      return true;
    }

    sendJson(res, 200, { user: sanitizeUser(user) });
    return true;
  }

  // ----------------------------------------------------
  // 4. POST /api/auth/update-profile
  // ----------------------------------------------------
  if (url === '/api/auth/update-profile' && method === 'POST') {
    const token = getBearerToken(req);
    const decoded = token ? verifyToken(token) : null;
    if (!decoded) {
      sendJson(res, 401, { error: 'Unauthorized.' });
      return true;
    }

    try {
      const body = await parseJsonBody(req);
      const { fullName } = body;
      if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
        sendJson(res, 400, { error: 'Full name must be at least 2 characters.' });
        return true;
      }

      const updated = updateUser(decoded.sub, { fullName: fullName.trim() });
      if (!updated) {
        sendJson(res, 404, { error: 'User not found.' });
        return true;
      }

      sendJson(res, 200, { 
        message: 'Profile updated successfully.', 
        user: sanitizeUser(updated) 
      });
      return true;
    } catch (err: any) {
      sendJson(res, 500, { error: err.message });
      return true;
    }
  }

  // ----------------------------------------------------
  // 5. POST /api/auth/change-password
  // ----------------------------------------------------
  if (url === '/api/auth/change-password' && method === 'POST') {
    const token = getBearerToken(req);
    const decoded = token ? verifyToken(token) : null;
    if (!decoded) {
      sendJson(res, 401, { error: 'Unauthorized.' });
      return true;
    }

    try {
      const body = await parseJsonBody(req);
      const { currentPassword, newPassword } = body;

      if (!currentPassword || !newPassword) {
        sendJson(res, 400, { error: 'Both current password and new password are required.' });
        return true;
      }

      if (newPassword.length < 6) {
        sendJson(res, 400, { error: 'New password must be at least 6 characters.' });
        return true;
      }

      const user = findUserById(decoded.sub);
      if (!user) {
        sendJson(res, 404, { error: 'User not found.' });
        return true;
      }

      const isCurrentValid = verifyPassword(currentPassword, user.salt, user.passwordHash);
      if (!isCurrentValid) {
        sendJson(res, 400, { error: 'Current password is incorrect.' });
        return true;
      }

      const newSalt = crypto.randomBytes(16).toString('hex');
      const newHash = hashPassword(newPassword, newSalt);

      updateUser(user.id, { salt: newSalt, passwordHash: newHash });

      sendJson(res, 200, { message: 'Password changed successfully.' });
      return true;
    } catch (err: any) {
      sendJson(res, 500, { error: err.message });
      return true;
    }
  }

  // ----------------------------------------------------
  // 6. POST /api/auth/forgot-password
  // ----------------------------------------------------
  if (url === '/api/auth/forgot-password' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { email } = body;
      const user = email ? findUserByEmail(email) : null;

      // Always return success for privacy
      sendJson(res, 200, {
        message: user
          ? 'Password recovery instructions have been dispatched to your email address.'
          : 'If an account exists with this email address, password reset instructions will be sent.'
      });
      return true;
    } catch (err: any) {
      sendJson(res, 500, { error: err.message });
      return true;
    }
  }

  // ----------------------------------------------------
  // 7. GET /api/admin/users
  // ----------------------------------------------------
  if (url === '/api/admin/users' && method === 'GET') {
    const token = getBearerToken(req);
    const decoded = token ? verifyToken(token) : null;
    if (!decoded || decoded.role !== 'Admin') {
      sendJson(res, 403, { error: 'Access Forbidden: Administrator privileges required.' });
      return true;
    }

    const users = getAllUsers();
    const stats = getPlatformStats();
    sendJson(res, 200, { users, stats });
    return true;
  }

  // ----------------------------------------------------
  // 8. POST /api/admin/users/:id/status
  // ----------------------------------------------------
  const statusMatch = url.match(/^\/api\/admin\/users\/([^/]+)\/status$/);
  if (statusMatch && method === 'POST') {
    const token = getBearerToken(req);
    const decoded = token ? verifyToken(token) : null;
    if (!decoded || decoded.role !== 'Admin') {
      sendJson(res, 403, { error: 'Access Forbidden: Administrator privileges required.' });
      return true;
    }

    const targetUserId = statusMatch[1];
    try {
      const body = await parseJsonBody(req);
      const { status } = body;

      if (status !== 'Active' && status !== 'Inactive') {
        sendJson(res, 400, { error: 'Status must be either Active or Inactive.' });
        return true;
      }

      const target = findUserById(targetUserId);
      if (!target) {
        sendJson(res, 404, { error: 'User not found.' });
        return true;
      }

      if (target.email.toLowerCase() === 'admin@codeforge.dev' && status === 'Inactive') {
        sendJson(res, 400, { error: 'Cannot deactivate primary system administrator account.' });
        return true;
      }

      if (target.id === decoded.sub && status === 'Inactive') {
        sendJson(res, 400, { error: 'Cannot deactivate your own active admin account.' });
        return true;
      }

      const updated = updateUser(targetUserId, { status });
      sendJson(res, 200, { message: `User status changed to ${status}.`, user: sanitizeUser(updated!) });
      return true;
    } catch (err: any) {
      sendJson(res, 500, { error: err.message });
      return true;
    }
  }

  // ----------------------------------------------------
  // 9. DELETE /api/admin/users/:id
  // ----------------------------------------------------
  const deleteMatch = url.match(/^\/api\/admin\/users\/([^/]+)$/);
  if (deleteMatch && method === 'DELETE') {
    const token = getBearerToken(req);
    const decoded = token ? verifyToken(token) : null;
    if (!decoded || decoded.role !== 'Admin') {
      sendJson(res, 403, { error: 'Access Forbidden: Administrator privileges required.' });
      return true;
    }

    const targetUserId = deleteMatch[1];
    try {
      const target = findUserById(targetUserId);
      if (!target) {
        sendJson(res, 404, { error: 'User not found.' });
        return true;
      }

      if (target.id === decoded.sub) {
        sendJson(res, 400, { error: 'You cannot delete your own logged-in administrator account.' });
        return true;
      }

      const deleted = deleteUser(targetUserId);
      if (!deleted) {
        sendJson(res, 400, { error: 'Failed to delete user account.' });
        return true;
      }

      sendJson(res, 200, { message: 'User account successfully deleted.' });
      return true;
    } catch (err: any) {
      sendJson(res, 400, { error: err.message });
      return true;
    }
  }

  // ----------------------------------------------------
  // 10. POST /api/admin/users/create
  // ----------------------------------------------------
  if (url === '/api/admin/users/create' && method === 'POST') {
    const token = getBearerToken(req);
    const decoded = token ? verifyToken(token) : null;
    if (!decoded || decoded.role !== 'Admin') {
      sendJson(res, 403, { error: 'Access Forbidden: Administrator privileges required.' });
      return true;
    }

    try {
      const body = await parseJsonBody(req);
      const { fullName, email, password, role = 'User', status = 'Active' } = body;

      if (!fullName || !email || !password) {
        sendJson(res, 400, { error: 'Full name, email, and password are required.' });
        return true;
      }

      if (role !== 'Admin' && role !== 'User') {
        sendJson(res, 400, { error: 'Role must be either Admin or User.' });
        return true;
      }

      const existing = findUserByEmail(email);
      if (existing) {
        sendJson(res, 409, { error: 'A user with this email address already exists.' });
        return true;
      }

      const newUser = createUser(fullName, email, password, role, status);
      sendJson(res, 201, { message: 'User created successfully.', user: sanitizeUser(newUser) });
      return true;
    } catch (err: any) {
      sendJson(res, 500, { error: err.message });
      return true;
    }
  }

  // ----------------------------------------------------
  // 11. GET /api/admin/stats
  // ----------------------------------------------------
  if (url === '/api/admin/stats' && method === 'GET') {
    const token = getBearerToken(req);
    const decoded = token ? verifyToken(token) : null;
    if (!decoded || decoded.role !== 'Admin') {
      sendJson(res, 403, { error: 'Access Forbidden: Administrator privileges required.' });
      return true;
    }

    const stats = getPlatformStats();
    sendJson(res, 200, { stats });
    return true;
  }

  return false;
}
