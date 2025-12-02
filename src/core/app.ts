import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { appConfig } from '../config/env';
import { errorHandler } from '../middleware/error-handler';
import { notFoundHandler } from '../middleware/not-found-handler';
import { routes } from '../routes';

export const createApp = (): Application => {
  const app = express();

  app.use(helmet());
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || appConfig.corsOrigins.includes('*') || appConfig.corsOrigins.includes(origin)) {
          callback(null, origin ?? '*');
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    }),
  );
  app.use(morgan('combined'));

  routes(app);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
