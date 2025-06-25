import express from 'express';
import dotenv from 'dotenv';
import textCheckRoutes from './routes/textCheckRoutes';
import logger from './utils/logger';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/text-check', textCheckRoutes);

app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});
