import 'node:process';
import { randomInt, randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';

const backendDir = dirname(fileURLToPath(import.meta.url));
const envPath = join(backendDir, '..', '.env');
if (existsSync(envPath)) process.loadEnvFile(envPath);

const app = express();
const port = Number(process.env.PORT || 4000);
const jwtSecret = process.env.JWT_SECRET || 'local-development-secret-change-before-deploying';
const dataDir = join(backendDir, 'data');
const dataPath = join(dataDir, 'crm-data.json');
const resetCodes = new Map();

app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], credentials: true }));
app.use(express.json({ limit: '2mb' }));

const now = () => new Date().toISOString();
const makeRecord = (fields = {}) => ({ id: randomUUID(), createdAt: now(), updatedAt: now(), ...fields });

function seedData() {
  const adminEmail = 'admin@crm.local';
  return {
    users: [{
      ...makeRecord({
        email: adminEmail,
        name: 'CRM Administrator',
        role: 'admin',
        accessRole: 'Admin',
        department: 'Administration',
        status: 'Active',
        phone: '',
        passwordHash: bcrypt.hashSync(process.env.SEED_ADMIN_PASSWORD || 'Admin123!', 10),
      }),
    }],
    clients: [
      makeRecord({ name: 'Jordan Lee', companyName: 'Northstar Labs', email: 'jordan@northstar.example', phone: '', website: '', tier: 'Premium', status: 'Active' }),
      makeRecord({ name: 'Morgan Chen', companyName: 'Fieldwork Studio', email: 'morgan@fieldwork.example', phone: '', website: '', tier: 'Standard', status: 'Active' }),
    ],
    projects: [],
    meetings: [],
    tickets: [],
    team: [],
  };
}

mkdirSync(dataDir, { recursive: true });
let db = existsSync(dataPath) ? JSON.parse(readFileSync(dataPath, 'utf8')) : seedData();
for (const collection of ['users', 'clients', 'projects', 'meetings', 'tickets', 'team']) {
  if (!Array.isArray(db[collection])) db[collection] = [];
}

function persist() {
  const temporaryPath = `${dataPath}.tmp`;
  writeFileSync(temporaryPath, JSON.stringify(db, null, 2));
  renameSync(temporaryPath, dataPath);
}
if (!existsSync(dataPath)) persist();

function publicUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function createToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, jwtSecret, { expiresIn: '7d' });
}

function authenticate(req, res, next) {
  const header = req.get('authorization') || '';
  const cookie = req.get('cookie')?.split(';').map((item) => item.trim()).find((item) => item.startsWith('auth_token='));
  const cookieToken = cookie ? decodeURIComponent(cookie.slice('auth_token='.length)) : null;
  const token = header.startsWith('Bearer ') ? header.slice(7) : cookieToken;
  if (!token) return res.status(401).json({ message: 'Authentication required.' });

  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = db.users.find((item) => item.id === payload.sub);
    if (!user) return res.status(401).json({ message: 'Session is no longer valid.' });
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: 'Session is invalid or expired.' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role?.toLowerCase() !== 'admin') return res.status(403).json({ message: 'Admin access required.' });
  return next();
}

function normalizeRecord(collection, input, existing = {}) {
  const record = { ...existing, ...input, id: existing.id || input.id || randomUUID(), createdAt: existing.createdAt || now(), updatedAt: now() };
  if (collection === 'clients') {
    record.companyName = input.companyName ?? existing.companyName ?? input.company ?? '';
    record.phone ??= '';
    record.website ??= '';
    record.tier ??= 'Standard';
    record.status ??= 'Active';
  }
  if (collection === 'projects') {
    record.name = input.name ?? existing.name ?? input.title ?? '';
    record.status ??= 'PLANNING';
    record.tags ??= [];
    record.files ??= [];
    record.credentials ??= [];
    record.milestones ??= [];
    record.comments ??= [];
    record.members ??= [];
  }
  if (collection === 'tickets') {
    record.ticketNumber ??= `TKT-${String(db.tickets.length + 1).padStart(4, '0')}`;
    record.status ??= 'TODO';
    record.priority ??= 'MEDIUM';
    record.tags ??= [];
  }
  return record;
}

function enrichRecord(collection, record) {
  if (collection === 'clients') {
    return { ...record, _count: { projects: db.projects.filter((project) => project.clientId === record.id).length } };
  }
  if (collection === 'projects') {
    const client = db.clients.find((item) => item.id === record.clientId);
    return { ...record, client: client ? { id: client.id, name: client.name, companyName: client.companyName } : null };
  }
  return record;
}

function listCollection(collection) {
  return (req, res) => {
    let records = db[collection];
    if (collection === 'meetings' && req.query.organizerId) {
      records = records.filter((record) => record.organizer === req.query.organizerId || record.organizerId === req.query.organizerId);
    }
    if (collection === 'projects' && req.query.clientId) {
      records = records.filter((record) => record.clientId === req.query.clientId);
    }
    return res.json(records.map((record) => enrichRecord(collection, record)));
  };
}

function getRecord(collection, responseKey = collection.slice(0, -1)) {
  return (req, res) => {
    const record = db[collection].find((item) => item.id === req.params.id);
    if (!record) return res.status(404).json({ message: `${responseKey} not found.` });
    return res.json({ [responseKey]: enrichRecord(collection, record) });
  };
}

function createRecord(collection, responseKey = collection.slice(0, -1)) {
  return (req, res) => {
    const record = normalizeRecord(collection, req.body);
    db[collection].unshift(record);
    persist();
    return res.status(201).json({ [responseKey]: enrichRecord(collection, record) });
  };
}

function updateRecord(collection, responseKey = collection.slice(0, -1)) {
  return (req, res) => {
    const index = db[collection].findIndex((item) => item.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: `${responseKey} not found.` });
    db[collection][index] = normalizeRecord(collection, req.body, db[collection][index]);
    persist();
    return res.json({ [responseKey]: enrichRecord(collection, db[collection][index]) });
  };
}

function deleteRecord(collection) {
  return (req, res) => {
    const index = db[collection].findIndex((item) => item.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Record not found.' });
    db[collection].splice(index, 1);
    persist();
    return res.json({ message: 'Deleted successfully.' });
  };
}

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'crm-backend' }));

app.post('/v1/login', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const user = db.users.find((item) => item.email.toLowerCase() === email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: 'Email or password is incorrect.' });
  }

  user.lastLogin = now();
  persist();
  const token = createToken(user);
  res.cookie('auth_token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' });
  return res.json({ token, user: publicUser(user) });
});

app.post('/v1/logout', (_req, res) => {
  res.clearCookie('auth_token', { httpOnly: true, sameSite: 'lax', path: '/' });
  return res.json({ message: 'Signed out successfully.' });
});

app.post('/v1/forgot-password', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const user = db.users.find((item) => item.email.toLowerCase() === email);
  if (!user) return res.json({ message: 'If that account exists, a reset code has been generated.' });
  const otp = String(randomInt(100000, 1000000));
  resetCodes.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000, verified: false });
  console.info(`[CRM DEV] Password reset code for ${email}: ${otp}`);
  return res.json({ message: 'Reset code generated. Check the backend terminal in local development.' });
});

app.post('/v1/verify-otp', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const reset = resetCodes.get(email);
  if (!reset || reset.expiresAt < Date.now() || reset.otp !== String(req.body?.otp || '')) {
    return res.status(400).json({ message: 'The reset code is invalid or expired.' });
  }
  reset.verified = true;
  return res.json({ message: 'Reset code verified.' });
});

app.put('/v1/change-password', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const reset = resetCodes.get(email);
  const user = db.users.find((item) => item.email.toLowerCase() === email);
  const password = String(req.body?.password || '');
  if (!user || !reset?.verified || reset.expiresAt < Date.now()) return res.status(400).json({ message: 'Verify a current reset code first.' });
  if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  user.passwordHash = await bcrypt.hash(password, 10);
  resetCodes.delete(email);
  persist();
  return res.json({ message: 'Password changed successfully.' });
});

app.use('/v1', authenticate);
app.get('/v1/profile', (req, res) => res.json({ user: publicUser(req.user) }));
app.patch('/v1/profile', (req, res) => {
  if (req.body?.email !== undefined) {
    const email = String(req.body.email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ message: 'A valid email address is required.' });
    if (db.users.some((user) => user.id !== req.user.id && user.email.toLowerCase() === email)) {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }
    req.user.email = email;
  }
  const allowed = ['name', 'phone', 'department', 'avatar', 'avatar_url', 'statusMessage'];
  for (const field of allowed) if (req.body?.[field] !== undefined) req.user[field] = req.body[field];
  req.user.updatedAt = now();
  persist();
  return res.json({ user: publicUser(req.user) });
});
app.get('/v1/status', (req, res) => res.json({ status: req.user.status || 'Active', statusMessage: req.user.statusMessage || '' }));
app.patch('/v1/status', (req, res) => {
  if (req.body?.status !== undefined) req.user.status = req.body.status;
  if (req.body?.statusMessage !== undefined) req.user.statusMessage = req.body.statusMessage;
  persist();
  return res.json({ status: req.user.status, statusMessage: req.user.statusMessage || '' });
});
app.get('/v1/users', requireAdmin, (_req, res) => res.json(db.users.map(publicUser)));
app.post('/v1/add-member', requireAdmin, async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  if (!email || password.length < 8) return res.status(400).json({ message: 'A valid email and password of at least 8 characters are required.' });
  if (db.users.some((user) => user.email.toLowerCase() === email)) return res.status(409).json({ message: 'A user with this email already exists.' });
  const user = { ...makeRecord({ ...req.body, email, role: req.body.role || 'developer', accessRole: req.body.accessRole || 'Developer', passwordHash: await bcrypt.hash(password, 10) }) };
  db.users.push(user);
  persist();
  return res.status(201).json({ user: publicUser(user) });
});
app.put('/v1/users/:id', requireAdmin, async (req, res) => {
  const user = db.users.find((item) => item.id === req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  Object.assign(user, req.body, { id: user.id, updatedAt: now() });
  if (req.body?.password) user.passwordHash = await bcrypt.hash(req.body.password, 10);
  delete user.password;
  persist();
  return res.json({ user: publicUser(user) });
});
app.delete('/v1/users/:id', requireAdmin, (req, res) => {
  if (req.user.id === req.params.id) return res.status(400).json({ message: 'You cannot delete your own account.' });
  const index = db.users.findIndex((item) => item.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'User not found.' });
  db.users.splice(index, 1);
  persist();
  return res.json({ message: 'User deleted.' });
});

const collections = {
  clients: 'client',
  projects: 'project',
  meetings: 'meeting',
  tickets: 'ticket',
  team: 'member',
};

for (const [collection, responseKey] of Object.entries(collections)) {
  app.get(`/${collection}`, authenticate, listCollection(collection));
  app.post(`/${collection}`, authenticate, createRecord(collection, responseKey));
  app.get(`/${collection}/:id`, authenticate, getRecord(collection, responseKey));
  app.put(`/${collection}/:id`, authenticate, updateRecord(collection, responseKey));
  app.patch(`/${collection}/:id`, authenticate, updateRecord(collection, responseKey));
  app.delete(`/${collection}/:id`, authenticate, deleteRecord(collection));
}

app.get('/projects/client/:clientId', authenticate, (req, res) => {
  const projects = db.projects.filter((project) => project.clientId === req.params.clientId);
  return res.json(projects.map((project) => enrichRecord('projects', project)));
});

app.all(['/projects/:id/:section', '/projects/:id/:section/:nestedId'], authenticate, (req, res) => {
  const project = db.projects.find((item) => item.id === req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found.' });
  const section = ['comments', 'members', 'credentials'].includes(req.params.section) ? req.params.section : null;
  if (!section) return res.status(404).json({ message: 'Project resource not found.' });
  project[section] ??= [];

  if (req.method === 'GET') return res.json(project[section]);
  if (req.method === 'POST') {
    const item = makeRecord(req.body || {});
    project[section].unshift(item);
    persist();
    return res.status(201).json({ [section.slice(0, -1)]: item, [section]: project[section] });
  }
  if (req.method === 'PUT' || req.method === 'PATCH') {
    const index = project[section].findIndex((item) => item.id === req.params.nestedId);
    if (index < 0) return res.status(404).json({ message: 'Project resource not found.' });
    project[section][index] = { ...project[section][index], ...req.body, id: project[section][index].id, updatedAt: now() };
    persist();
    return res.json({ [section.slice(0, -1)]: project[section][index] });
  }
  if (req.method === 'DELETE') {
    const index = project[section].findIndex((item) => item.id === req.params.nestedId);
    if (index < 0) return res.status(404).json({ message: 'Project resource not found.' });
    project[section].splice(index, 1);
    persist();
    return res.json({ message: 'Deleted successfully.' });
  }
  return res.status(405).json({ message: 'Method not allowed.' });
});

app.use((err, _req, res, _next) => {
  console.error('[CRM API]', err);
  return res.status(500).json({ message: 'An unexpected server error occurred.' });
});

app.listen(port, '127.0.0.1', () => {
  console.info(`CRM API listening on http://127.0.0.1:${port}`);
  if (!process.env.JWT_SECRET) console.warn('Using the local development JWT secret. Configure JWT_SECRET before deployment.');
});
