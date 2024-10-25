import express from 'express';
import dotenv from 'dotenv';
import complianceRoutes from './routes/complianceRoutes';
import logger from './utils/logger';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/compliance', complianceRoutes);

app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});
