require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pino = require('pino');
const pinoHttp = require('pino-http');
const { getPool } = require('./db');

const logger = pino({ level: 'info' });

const PORT = process.env.PORT || 8080;

// Origins allowed to call the API. Empty allows any origin.
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const app = express();
app.use(cors(allowedOrigins.length > 0 ? { origin: allowedOrigins } : {}));
app.use(pinoHttp({ logger }));
app.use(express.json({ limit: '10kb' }));

async function databaseState() {
  const pool = getPool();
  if (!pool) return 'not configured';
  try {
    await pool.query('SELECT 1');
    return 'connected';
  } catch {
    return 'not connected';
  }
}

// Always 200 while the server is up, so the platform keeps the container running while the database is still being reached.
app.get('/healthz', async (_req, res) => {
  res.json({ status: 'ok', database: await databaseState() });
});

const asyncRoute = (handler) => (req, res, next) => handler(req, res).catch(next);

async function readCounter(pool) {
  const [rows] = await pool.query('SELECT value FROM counter WHERE id = 1');
  return rows.length > 0 ? { value: Number(rows[0].value) } : null;
}

const counter = express.Router();

counter.use((_req, res, next) => {
  if (!getPool()) return res.status(503).json({ error: 'DATABASE_URL is not set.' });
  next();
});

counter.get('/', asyncRoute(async (_req, res) => {
  const current = await readCounter(getPool());
  if (!current) return res.status(503).json({ error: 'The counter table is empty. Run npm run migrate.' });
  res.json(current);
}));

// Each change is one statement, so two clicks at once are both counted.
for (const [action, sql] of [
  ['increment', 'UPDATE counter SET value = value + 1 WHERE id = 1'],
  ['decrement', 'UPDATE counter SET value = value - 1 WHERE id = 1'],
  ['reset', 'UPDATE counter SET value = 0 WHERE id = 1'],
]) {
  counter.post(`/${action}`, asyncRoute(async (_req, res) => {
    const pool = getPool();
    await pool.query(sql);
    const current = await readCounter(pool);
    if (!current) return res.status(503).json({ error: 'The counter table is empty. Run npm run migrate.' });
    res.json(current);
  }));
}

counter.put('/', asyncRoute(async (req, res) => {
  const value = req.body && req.body.value;
  if (!Number.isSafeInteger(value)) {
    return res.status(400).json({ error: 'value must be a whole number.' });
  }
  const pool = getPool();
  await pool.query('UPDATE counter SET value = ? WHERE id = 1', [value]);
  const current = await readCounter(pool);
  if (!current) return res.status(503).json({ error: 'The counter table is empty. Run npm run migrate.' });
  res.json(current);
}));

app.use('/api/counter', counter);

app.use((err, req, res, _next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON.' });
  (req.log || logger).error({ err, requestId: req.id }, 'Unhandled error');
  // A broken connection or a missing table means the database is not ready; say so instead of a bare 500.
  if (err.code && /^(ECONN|ETIMEDOUT|ENOTFOUND|PROTOCOL_|ER_NO_SUCH_TABLE|ER_ACCESS_DENIED)/.test(err.code)) {
    return res.status(503).json({ error: 'The database is not ready.' });
  }
  res.status(500).json({ error: 'Something went wrong.' });
});

app.listen(PORT, '0.0.0.0', () => {
  logger.info({ port: PORT }, `Counter API listening on port ${PORT}`);
});
