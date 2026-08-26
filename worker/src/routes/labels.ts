import { Hono } from 'hono';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import type { Env } from '../bindings';
import { getDb } from '../db/client';
import { labels } from '../db/schema';
import { ok, fail } from '../lib/response';

export const labelRoutes = new Hono<{ Bindings: Env }>();

const serializeLabel = (row: typeof labels.$inferSelect) => ({
  id: row.id,
  name: row.name,
  color: row.color,
  createdAt: new Date(row.createdAt).toISOString(),
});

const labelInputSchema = z.object({
  name: z.string().min(1),
  color: z.string().min(1),
});

labelRoutes.get('/', async (c) => {
  const db = getDb(c.env.DB);
  const rows = await db.select().from(labels).all();
  return c.json(ok(rows.map(serializeLabel)));
});

labelRoutes.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = labelInputSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(fail(parsed.error.message), 400);
  }
  const db = getDb(c.env.DB);
  const [row] = await db.insert(labels).values(parsed.data).returning();
  return c.json(ok(serializeLabel(row)), 201);
});

labelRoutes.put('/:id', async (c) => {
  const body = await c.req.json();
  const parsed = labelInputSchema.partial().safeParse(body);
  if (!parsed.success) {
    return c.json(fail(parsed.error.message), 400);
  }
  const db = getDb(c.env.DB);
  const [row] = await db
    .update(labels)
    .set(parsed.data)
    .where(eq(labels.id, c.req.param('id')))
    .returning();
  if (!row) return c.json(fail('Label not found'), 404);
  return c.json(ok(serializeLabel(row)));
});

labelRoutes.delete('/:id', async (c) => {
  const db = getDb(c.env.DB);
  await db.delete(labels).where(eq(labels.id, c.req.param('id')));
  return c.json(ok(null));
});
