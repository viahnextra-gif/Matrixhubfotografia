import { Router } from 'express';

export type Currency = 'BRL' | 'MCOIN';
export type LedgerEntry = {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'commission' | 'settlement';
  amount: number;
  currency: Currency;
  fee?: number;
  description?: string;
};

export const fintechRouter = Router();

fintechRouter.get('/wallets/:userId', (req, res) => {
  const { userId } = req.params;
  res.json({
    userId,
    balances: {
      BRL: { available: 10250.5, pending: 1500 },
      MCOIN: { available: 7200, pending: 300 },
    },
    ledger: [
      { id: 'txn-1', type: 'deposit', amount: 500, currency: 'BRL', description: 'Depósito PIX' },
      { id: 'txn-2', type: 'commission', amount: -75, currency: 'BRL', fee: 0.03, description: 'Taxa plataforma' },
      { id: 'txn-3', type: 'payment', amount: -3200, currency: 'BRL', description: 'Serviço Fotografia' },
    ] as LedgerEntry[],
  });
});

fintechRouter.post('/wallets/:userId/deposit/pix', (req, res) => {
  const { userId } = req.params;
  const { amount } = req.body as { amount: number };
  res.status(201).json({
    userId,
    requestId: `pix-${Date.now()}`,
    amount,
    status: 'processing',
  });
});

fintechRouter.post('/wallets/:userId/transfer', (req, res) => {
  const { userId } = req.params;
  const { toUserId, amount, currency } = req.body as { toUserId: string; amount: number; currency: Currency };
  res.json({
    from: userId,
    to: toUserId,
    amount,
    currency,
    feeRate: 0.03,
    status: 'scheduled',
  });
});

fintechRouter.post('/wallets/:userId/payout', (req, res) => {
  const { userId } = req.params;
  const { amount } = req.body as { amount: number };
  res.json({
    userId,
    amount,
    status: 'in-review',
    kycRequired: amount > 5000,
  });
});

fintechRouter.post('/wallets/:userId/settlements', (req, res) => {
  const { userId } = req.params;
  const { grossAmount, currency } = req.body as { grossAmount: number; currency: Currency; professionalId: string };
  const platformFeeRate = 0.05;
  const platformFee = grossAmount * platformFeeRate;
  const netAmount = grossAmount - platformFee;

  res.json({
    professionalId: userId,
    grossAmount,
    currency,
    platformFeeRate,
    platformFee,
    netAmount,
    status: 'settled',
    fallbackGateway: 'stripe',
  });
});

fintechRouter.get('/reports/daily', (_req, res) => {
  res.json({
    date: '2025-12-01',
    totals: {
      deposits: 15400,
      payouts: 9200,
      commissions: 480,
      taxesWithheld: 320,
    },
  });
});

fintechRouter.get('/reports/transactions', (_req, res) => {
  res.json({
    filters: { range: 'month', currency: 'BRL' },
    transactions: [
      { id: 'txn-10', type: 'payment', amount: 1200, currency: 'BRL', description: 'Workshop fotografia' },
      { id: 'txn-11', type: 'commission', amount: -60, currency: 'BRL', description: '5% plataforma' },
      { id: 'txn-12', type: 'transfer', amount: -300, currency: 'MCOIN', description: 'Pagamento em coins' },
    ],
  });
});
