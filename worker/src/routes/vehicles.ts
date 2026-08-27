import { Hono } from 'hono';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import type { Env } from '../bindings';
import { getDb } from '../db/client';
import { vehicles } from '../db/schema';
import { ok, fail } from '../lib/response';
import { serializeVehicle } from '../lib/serialize';

export const vehicleRoutes = new Hono<{ Bindings: Env }>();

const vehicleInputSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1),
  category: z.enum(['sales', 'liaison', 'wcab', 'rental', 'mobile', 'other']).default('other'),
  plateNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

vehicleRoutes.get('/', async (c) => {
  const db = getDb(c.env.DB);
  const rows = await db.select().from(vehicles).all();
  return c.json(ok(rows.map(serializeVehicle)));
});

vehicleRoutes.put('/', async (c) => {
  const body = await c.req.json();
  const parsed = vehicleInputSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(fail(parsed.error.message), 400);
  }
  const input = parsed.data;
  const db = getDb(c.env.DB);
  const now = new Date();

  const values = {
    name: input.name,
    category: input.category,
    plateNumber: input.plateNumber ?? null,
    notes: input.notes ?? null,
    isActive: input.isActive,
    updatedAt: now,
  };

  const [row] = input.id
    ? await db
        .insert(vehicles)
        .values({ id: input.id, ...values, createdAt: now })
        .onConflictDoUpdate({ target: vehicles.id, set: values })
        .returning()
    : await db.insert(vehicles).values({ ...values, createdAt: now }).returning();

  return c.json(ok(serializeVehicle(row)));
});

vehicleRoutes.delete('/:id', async (c) => {
  const db = getDb(c.env.DB);
  await db.delete(vehicles).where(eq(vehicles.id, c.req.param('id')));
  return c.json(ok(null));
});
