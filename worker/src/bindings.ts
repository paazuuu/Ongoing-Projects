export interface Env {
  DB: D1Database;
  ATTACHMENTS: R2Bucket;
  ALLOWED_ORIGIN?: string;
}
