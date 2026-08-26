import { Hono } from 'hono';
import { sql } from 'drizzle-orm';
import type { Env } from '../bindings';
import { getDb } from '../db/client';

export const healthRoutes = new Hono<{ Bindings: Env }>();

healthRoutes.get('/', async (c) => {
  const db = getDb(c.env.DB);
  await db.run(sql`SELECT 1`);
  return c.json({ success: true, data: { status: 'ok' }, error: null });
});
