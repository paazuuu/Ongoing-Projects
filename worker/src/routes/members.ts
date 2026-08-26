import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../bindings';
import { getDb } from '../db/client';
import { members } from '../db/schema';
import { ok, fail } from '../lib/response';
import { serializeMember } from '../lib/serialize';

export const memberRoutes = new Hono<{ Bindings: Env }>();

const memberInputSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1),
  team: z.string().min(1),
  qualifications: z.array(z.string()).default([]),
  availableHours: z.object({
    start: z.string().min(1),
    end: z.string().min(1),
  }),
  availableAreas: z.array(z.string()).default([]),
  notes: z.string().default(''),
  isActive: z.boolean().default(true),
});

memberRoutes.get('/', async (c) => {
  const db = getDb(c.env.DB);
  const rows = await db.select().from(members).all();
  return c.json(ok(rows.map(serializeMember)));
});

memberRoutes.put('/', async (c) => {
  const body = await c.req.json();
  const parsed = memberInputSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(fail(parsed.error.message), 400);
  }
  const input = parsed.data;
  const db = getDb(c.env.DB);
  const now = new Date();

  const values = {
    name: input.name,
    team: input.team,
    qualifications: input.qualifications,
    availableHoursStart: input.availableHours.start,
    availableHoursEnd: input.availableHours.end,
    availableAreas: input.availableAreas,
    notes: input.notes,
    isActive: input.isActive,
    updatedAt: now,
  };

  const [row] = input.id
    ? await db
        .insert(members)
        .values({ id: input.id, ...values, createdAt: now })
        .onConflictDoUpdate({ target: members.id, set: values })
        .returning()
    : await db.insert(members).values({ ...values, createdAt: now }).returning();

  return c.json(ok(serializeMember(row)));
});
