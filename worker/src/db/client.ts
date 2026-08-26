import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export const getDb = (DB: D1Database) => drizzle(DB, { schema });

export type Db = ReturnType<typeof getDb>;
