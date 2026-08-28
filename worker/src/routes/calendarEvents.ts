import { Hono } from 'hono';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import type { Env } from '../bindings';
import { getDb, type Db } from '../db/client';
import { calendarEvents, calendarEventMembers } from '../db/schema';
import { ok, fail } from '../lib/response';
import { serializeCalendarEvent } from '../lib/serialize';

export const calendarEventRoutes = new Hono<{ Bindings: Env }>();

const eventInputSchema = z.object({
  id: z.string().min(1).optional(),
  title: z.string().min(1),
  date: z.string().min(1),
  isAllDay: z.boolean().default(true),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  color: z.string().min(1).default('#3b82f6'),
  memo: z.string().default(''),
  memberIds: z.array(z.string().min(1)).default([]),
  eventType: z.string().optional().nullable(),
});

type EventInput = z.infer<typeof eventInputSchema>;

const loadMemberMap = async (db: Db): Promise<Map<string, string[]>> => {
  const rows = await db.select().from(calendarEventMembers).all();
  const map = new Map<string, string[]>();
  for (const row of rows) {
    const arr = map.get(row.eventId);
    if (arr) arr.push(row.memberId);
    else map.set(row.eventId, [row.memberId]);
  }
  return map;
};

const writeEvent = async (db: Db, id: string, input: EventInput) => {
  const now = new Date();
  const values = {
    title: input.title,
    date: input.date,
    isAllDay: input.isAllDay,
    startTime: input.isAllDay ? null : input.startTime ?? null,
    endTime: input.isAllDay ? null : input.endTime ?? null,
    color: input.color,
    memo: input.memo,
    eventType: input.eventType ?? null,
    updatedAt: now,
  };

  await db
    .insert(calendarEvents)
    .values({ id, ...values, createdAt: now })
    .onConflictDoUpdate({ target: calendarEvents.id, set: values });

  await db.batch([
    db.delete(calendarEventMembers).where(eq(calendarEventMembers.eventId, id)),
    ...(input.memberIds.length
      ? [
          db
            .insert(calendarEventMembers)
            .values(input.memberIds.map((memberId) => ({ eventId: id, memberId }))),
        ]
      : []),
  ]);

  const [row] = await db.select().from(calendarEvents).where(eq(calendarEvents.id, id));
  return serializeCalendarEvent(row, input.memberIds);
};

calendarEventRoutes.get('/', async (c) => {
  const db = getDb(c.env.DB);
  const rows = await db.select().from(calendarEvents).all();
  const memberMap = await loadMemberMap(db);
  return c.json(ok(rows.map((row) => serializeCalendarEvent(row, memberMap.get(row.id) ?? []))));
});

calendarEventRoutes.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = eventInputSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(fail(parsed.error.message), 400);
  }
  const db = getDb(c.env.DB);
  const id = parsed.data.id ?? crypto.randomUUID();
  return c.json(ok(await writeEvent(db, id, parsed.data)), 201);
});

calendarEventRoutes.put('/:id', async (c) => {
  const body = await c.req.json();
  const parsed = eventInputSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(fail(parsed.error.message), 400);
  }
  const db = getDb(c.env.DB);
  return c.json(ok(await writeEvent(db, c.req.param('id'), parsed.data)));
});

calendarEventRoutes.delete('/:id', async (c) => {
  const db = getDb(c.env.DB);
  await db.delete(calendarEvents).where(eq(calendarEvents.id, c.req.param('id')));
  return c.json(ok(null));
});
