import { Router } from 'express';

export const gamificationRouter = Router();

gamificationRouter.get('/wallet/:userId', (req, res) => {
  res.json({ userId: req.params.userId, balance: 250, currency: 'MCOIN' });
});

gamificationRouter.post('/missions', (req, res) => {
  res.status(201).json({
    missionId: 'mission-1',
    audience: req.body.audience ?? 'all',
    reward: req.body.reward ?? 50,
  });
});

gamificationRouter.post('/missions/:id/claim', (req, res) => {
  res.json({ missionId: req.params.id, userId: req.body.userId, status: 'claimed', coinsGranted: 10 });
});
