import { Hono } from 'hono';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import type { Env } from '../bindings';
import { getDb } from '../db/client';
import { attachments } from '../db/schema';
import { ok, fail } from '../lib/response';

export const attachmentRoutes = new Hono<{ Bindings: Env }>();

const serializeAttachment = (row: typeof attachments.$inferSelect) => ({
  id: row.id,
  entityType: row.entityType,
  entityId: row.entityId,
  fileName: row.fileName,
  mimeType: row.mimeType,
  size: row.size,
  createdAt: new Date(row.createdAt).toISOString(),
});

const querySchema = z.object({
  entityType: z.enum(['project', 'member']),
  entityId: z.string().min(1),
});

attachmentRoutes.get('/', async (c) => {
  const parsed = querySchema.safeParse({
    entityType: c.req.query('entityType'),
    entityId: c.req.query('entityId'),
  });
  if (!parsed.success) {
    return c.json(fail(parsed.error.message), 400);
  }
  const db = getDb(c.env.DB);
  const rows = await db
    .select()
    .from(attachments)
    .where(
      and(
        eq(attachments.entityType, parsed.data.entityType),
        eq(attachments.entityId, parsed.data.entityId)
      )
    )
    .all();
  return c.json(ok(rows.map(serializeAttachment)));
});

attachmentRoutes.post('/', async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File | string | null;
  const entityType = formData.get('entityType');
  const entityId = formData.get('entityId');

  const parsed = querySchema.safeParse({ entityType, entityId });
  if (!parsed.success || typeof file === 'string' || file === null || !(file instanceof File)) {
    return c.json(fail('entityType, entityId, and file are required'), 400);
  }

  const db = getDb(c.env.DB);
  const id = crypto.randomUUID();
  const r2Key = `${parsed.data.entityType}/${parsed.data.entityId}/${id}-${file.name}`;

  await c.env.ATTACHMENTS.put(r2Key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  const [row] = await db
    .insert(attachments)
    .values({
      id,
      entityType: parsed.data.entityType,
      entityId: parsed.data.entityId,
      r2Key,
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
    })
    .returning();

  return c.json(ok(serializeAttachment(row)), 201);
});

attachmentRoutes.get('/:id', async (c) => {
  const db = getDb(c.env.DB);
  const [row] = await db.select().from(attachments).where(eq(attachments.id, c.req.param('id')));
  if (!row) return c.json(fail('Attachment not found'), 404);

  const object = await c.env.ATTACHMENTS.get(row.r2Key);
  if (!object) return c.json(fail('File not found in storage'), 404);

  c.header('Content-Type', row.mimeType);
  c.header('Content-Disposition', `attachment; filename="${row.fileName}"`);
  return c.body(object.body);
});

attachmentRoutes.delete('/:id', async (c) => {
  const db = getDb(c.env.DB);
  const [row] = await db.select().from(attachments).where(eq(attachments.id, c.req.param('id')));
  if (!row) return c.json(fail('Attachment not found'), 404);

  await c.env.ATTACHMENTS.delete(row.r2Key);
  await db.delete(attachments).where(eq(attachments.id, row.id));

  return c.json(ok(null));
});
