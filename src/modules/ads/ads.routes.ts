import { Router } from 'express';

export const adsRouter = Router();

adsRouter.post('/campaigns', (req, res) => {
  res.status(201).json({
    id: 'ad-1',
    targeting: req.body.targeting ?? { location: 'BR', interests: [] },
    budget: req.body.budget ?? 100,
    status: 'draft',
  });
});

adsRouter.get('/campaigns/:id/performance', (req, res) => {
  res.json({
    id: req.params.id,
    impressions: 1200,
    clicks: 123,
    spend: 57.4,
    currency: 'BRL',
  });
});
