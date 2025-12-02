import { Router } from 'express';

export const marketplaceRouter = Router();

marketplaceRouter.get('/products', (_req, res) => {
  res.json({
    items: [
      { id: 'album-basic', name: 'Álbum fotográfico', price: 199.9, options: { size: '30x30', finish: 'fosco' } },
    ],
  });
});

marketplaceRouter.get('/services', (_req, res) => {
  res.json({
    items: [
      { id: 'session-standard', name: 'Ensaio externo', durationMinutes: 120, location: 'São Paulo' },
    ],
  });
});

marketplaceRouter.post('/checkout', (req, res) => {
  res.status(201).json({
    orderId: 'ord-123',
    paymentProvider: req.body.provider ?? 'stripe',
    splitRules: req.body.splitRules ?? [],
    status: 'awaiting_payment',
  });
});
