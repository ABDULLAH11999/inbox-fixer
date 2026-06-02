const { Pool } = require('pg');

function readStdin() {
  return new Promise((resolve) => {
    let raw = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      raw += chunk;
    });
    process.stdin.on('end', () => resolve(raw));
    process.stdin.resume();
  });
}

function quoteIdentifier(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

async function ensureTable(pool, tableName) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${quoteIdentifier(tableName)} (
      id BIGSERIAL PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function insertRows(pool, tableName, rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return;
  }

  for (const row of rows) {
    await pool.query(
      `INSERT INTO ${quoteIdentifier(tableName)} (data) VALUES ($1::jsonb)`,
      [JSON.stringify(row)]
    );
  }
}

async function main() {
  const action = process.argv[2];
  const tableName = process.argv[3];
  const payload = JSON.parse((await readStdin()) || '{}');

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set.');
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || '')
      ? false
      : { rejectUnauthorized: false }
  });

  try {
    await ensureTable(pool, tableName);

    if (action === 'read') {
      const countRes = await pool.query(`SELECT COUNT(*)::int AS count FROM ${quoteIdentifier(tableName)}`);

      if (countRes.rows[0].count === 0 && Array.isArray(payload.seed) && payload.seed.length > 0) {
        await insertRows(pool, tableName, payload.seed);
      }

      const res = await pool.query(`SELECT data FROM ${quoteIdentifier(tableName)} ORDER BY id ASC`);
      process.stdout.write(JSON.stringify(res.rows.map((row) => row.data)));
      return;
    }

    if (action === 'write') {
      await pool.query(`DELETE FROM ${quoteIdentifier(tableName)}`);
      await insertRows(pool, tableName, Array.isArray(payload.rows) ? payload.rows : []);
      process.stdout.write(JSON.stringify({ success: true }));
      return;
    }

    if (action === 'read-one') {
      const countRes = await pool.query(`SELECT COUNT(*)::int AS count FROM ${quoteIdentifier(tableName)}`);

      if (countRes.rows[0].count === 0 && Array.isArray(payload.seed) && payload.seed.length > 0) {
        await insertRows(pool, tableName, payload.seed);
      }

      const res = await pool.query(
        `SELECT data FROM ${quoteIdentifier(tableName)} ORDER BY id ASC LIMIT 1`
      );
      process.stdout.write(JSON.stringify(res.rows[0]?.data ?? null));
      return;
    }

    if (action === 'write-one') {
      await pool.query(`DELETE FROM ${quoteIdentifier(tableName)}`);
      if (payload.row !== undefined) {
        await insertRows(pool, tableName, [payload.row]);
      }
      process.stdout.write(JSON.stringify({ success: true }));
      return;
    }

    throw new Error(`Unsupported action: ${action}`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
