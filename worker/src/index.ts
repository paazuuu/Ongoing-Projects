import { Hono, type Context } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './bindings';
import { healthRoutes } from './routes/health';
import { memberRoutes } from './routes/members';
import { externalPartnerRoutes } from './routes/externalPartners';
import { projectRoutes } from './routes/projects';
import { labelRoutes } from './routes/labels';
import { checklistRoutes } from './routes/checklist';
import { commentRoutes } from './routes/comments';
import { attachmentRoutes } from './routes/attachments';

const app = new Hono<{ Bindings: Env }>();

app.use(
  '*',
  cors({
    origin: (origin, c: Context<{ Bindings: Env }>) => {
      const allowed = c.env.ALLOWED_ORIGIN;
      if (!allowed) return origin;
      const allowedOrigins = allowed.split(',').map((o) => o.trim());
      return allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
    },
  })
);

app.route('/api/health', healthRoutes);
app.route('/api/members', memberRoutes);
app.route('/api/external-partners', externalPartnerRoutes);
app.route('/api/projects', projectRoutes);
app.route('/api/labels', labelRoutes);
app.route('/api', checklistRoutes);
app.route('/api', commentRoutes);
app.route('/api/attachments', attachmentRoutes);

export default app;
