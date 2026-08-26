import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../bindings';
import { getDb } from '../db/client';
import { externalPartners } from '../db/schema';
import { ok, fail } from '../lib/response';
import { serializeExternalPartner } from '../lib/serialize';

export const externalPartnerRoutes = new Hono<{ Bindings: Env }>();

const partnerInputSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1),
  isActive: z.boolean().default(true),
});

externalPartnerRoutes.get('/', async (c) => {
  const db = getDb(c.env.DB);
  const rows = await db.select().from(externalPartners).all();
  return c.json(ok(rows.map(serializeExternalPartner)));
});

externalPartnerRoutes.put('/', async (c) => {
  const body = await c.req.json();
  const parsed = partnerInputSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(fail(parsed.error.message), 400);
  }
  const input = parsed.data;
  const db = getDb(c.env.DB);
  const now = new Date();

  const values = {
    name: input.name,
    isActive: input.isActive,
    updatedAt: now,
  };

  const [row] = input.id
    ? await db
        .insert(externalPartners)
        .values({ id: input.id, ...values, createdAt: now })
        .onConflictDoUpdate({ target: externalPartners.id, set: values })
        .returning()
    : await db.insert(externalPartners).values({ ...values, createdAt: now }).returning();

  return c.json(ok(serializeExternalPartner(row)));
});
