import { Application } from 'express';
import { adsRouter } from '../modules/ads/ads.routes';
import { aiRouter } from '../modules/ai/ai.routes';
import { authRouter } from '../modules/auth/auth.routes';
import { chatRouter } from '../modules/chat/chat.routes';
import { crmRouter } from '../modules/crm/crm.routes';
import { fintechRouter } from '../modules/fintech/fintech.routes';
import { gamificationRouter } from '../modules/gamification/gamification.routes';
import { marketplaceRouter } from '../modules/marketplace/marketplace.routes';
import { mediaRouter } from '../modules/media/media.routes';
import { professionalsRouter } from '../modules/professionals/professionals.routes';
import { socialRouter } from '../modules/social/social.routes';

export const routes = (app: Application): void => {
  app.use('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/auth', authRouter);
  app.use('/media', mediaRouter);
  app.use('/marketplace', marketplaceRouter);
  app.use('/social', socialRouter);
  app.use('/crm', crmRouter);
  app.use('/gamification', gamificationRouter);
  app.use('/fintech', fintechRouter);
  app.use('/ads', adsRouter);
  app.use('/ai', aiRouter);
  app.use('/chat', chatRouter);
  app.use('/professionals', professionalsRouter);
};
