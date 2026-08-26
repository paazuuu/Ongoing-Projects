import { Hono } from 'hono';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import type { Env } from '../bindings';
import { getDb } from '../db/client';
import { comments } from '../db/schema';
import { ok, fail } from '../lib/response';

export const commentRoutes = new Hono<{ Bindings: Env }>();

const serializeComment = (row: typeof comments.$inferSelect) => ({
  id: row.id,
  projectId: row.projectId,
  authorName: row.authorName,
  body: row.body,
  createdAt: new Date(row.createdAt).toISOString(),
});

const createSchema = z.object({
  authorName: z.string().min(1).optional().nullable(),
  body: z.string().min(1),
});

commentRoutes.get('/projects/:projectId/comments', async (c) => {
  const db = getDb(c.env.DB);
  const rows = await db
    .select()
    .from(comments)
    .where(eq(comments.projectId, c.req.param('projectId')))
    .orderBy(desc(comments.createdAt))
    .all();
  return c.json(ok(rows.map(serializeComment)));
});

commentRoutes.post('/projects/:projectId/comments', async (c) => {
  const body = await c.req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(fail(parsed.error.message), 400);
  }
  const db = getDb(c.env.DB);
  const [row] = await db
    .insert(comments)
    .values({
      projectId: c.req.param('projectId'),
      authorName: parsed.data.authorName ?? null,
      body: parsed.data.body,
    })
    .returning();
  return c.json(ok(serializeComment(row)), 201);
});

commentRoutes.delete('/comments/:id', async (c) => {
  const db = getDb(c.env.DB);
  await db.delete(comments).where(eq(comments.id, c.req.param('id')));
  return c.json(ok(null));
});
