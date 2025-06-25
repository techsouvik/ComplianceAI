import express from 'express';
import complianceRoutes from './routes/complianceRoutes';
import firecrawlRoutes from './routes/firecrawlRoutes';
import logger from './utils/logger';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use('/api/compliance', complianceRoutes);
app.use('/api/firecrawl', firecrawlRoutes);

app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});
