import express from 'express';
import cors from 'cors';
import adminUsersRouter from './routes/adminUsers';
import meRouter from './routes/me';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  return res.json({ ok: true });
});

app.use('/api/me', meRouter);
app.use('/api/admin/users', adminUsersRouter);

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Lynbrook Sports Medicine API listening on port ${PORT}`);
});
