import { Router } from 'express';
import { HttpError } from '../../types/http-error';

export type Currency = 'BRL' | 'MCOIN';
export type LedgerEntry = {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'commission' | 'settlement';
  amount: number;
  currency: Currency;
  fee?: number;
  description?: string;
  createdAt: string;
};

export type Wallet = {
  balances: Record<Currency, { available: number; pending: number }>;
  ledger: LedgerEntry[];
};

const walletStore = new Map<string, Wallet>();

const getWallet = (userId: string): Wallet => {
  if (!walletStore.has(userId)) {
    walletStore.set(userId, {
      balances: {
        BRL: { available: 10250.5, pending: 1500 },
        MCOIN: { available: 7200, pending: 300 },
      },
      ledger: [
        { id: 'txn-1', type: 'deposit', amount: 500, currency: 'BRL', description: 'Depósito PIX', createdAt: new Date().toISOString() },
        {
          id: 'txn-2',
          type: 'commission',
          amount: -75,
          currency: 'BRL',
          fee: 0.03,
          description: 'Taxa plataforma',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'txn-3',
          type: 'payment',
          amount: -3200,
          currency: 'BRL',
          description: 'Serviço Fotografia',
          createdAt: new Date().toISOString(),
        },
      ],
    });
  }

  return walletStore.get(userId)!;
};

export const fintechRouter = Router();

fintechRouter.get('/wallets/:userId', (req, res) => {
  const { userId } = req.params;
  res.json({ userId, ...getWallet(userId) });
});

fintechRouter.post('/wallets/:userId/deposit/pix', (req, res) => {
  const { userId } = req.params;
  const { amount } = req.body as { amount: number };
  if (!amount || amount <= 0) {
    throw new HttpError(400, 'amount must be greater than zero');
  }
  const wallet = getWallet(userId);
  wallet.balances.BRL.pending += amount;
  const entry: LedgerEntry = {
    id: `pix-${Date.now()}`,
    type: 'deposit',
    amount,
    currency: 'BRL',
    description: 'Depósito PIX pendente',
    createdAt: new Date().toISOString(),
  };
  wallet.ledger.unshift(entry);
  res.status(201).json({ userId, requestId: entry.id, amount, status: 'processing' });
});

fintechRouter.post('/wallets/:userId/transfer', (req, res) => {
  const { userId } = req.params;
  const { toUserId, amount, currency } = req.body as { toUserId: string; amount: number; currency: Currency };
  if (!toUserId || !amount || amount <= 0) {
    throw new HttpError(400, 'toUserId and positive amount are required');
  }
  const wallet = getWallet(userId);
  if (wallet.balances[currency].available < amount) {
    throw new HttpError(400, 'insufficient balance');
  }

  wallet.balances[currency].available -= amount;
  const targetWallet = getWallet(toUserId);
  targetWallet.balances[currency].available += amount;

  const entry: LedgerEntry = {
    id: `transfer-${Date.now()}`,
    type: 'transfer',
    amount: -amount,
    currency,
    description: `Transferência para ${toUserId}`,
    createdAt: new Date().toISOString(),
  };
  wallet.ledger.unshift(entry);
  targetWallet.ledger.unshift({ ...entry, id: `${entry.id}-credit`, amount, description: `Transferência de ${userId}` });

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
  if (!amount || amount <= 0) {
    throw new HttpError(400, 'amount must be greater than zero');
  }
  const wallet = getWallet(userId);
  if (wallet.balances.BRL.available < amount) {
    throw new HttpError(400, 'insufficient balance for payout');
  }
  wallet.balances.BRL.available -= amount;
  wallet.balances.BRL.pending += amount;

  const entry: LedgerEntry = {
    id: `payout-${Date.now()}`,
    type: 'withdrawal',
    amount: -amount,
    currency: 'BRL',
    description: 'Saque solicitado',
    createdAt: new Date().toISOString(),
  };
  wallet.ledger.unshift(entry);

  res.json({
    userId,
    amount,
    status: 'in-review',
    kycRequired: amount > 5000,
  });
});

fintechRouter.post('/wallets/:userId/settlements', (req, res) => {
  const { userId } = req.params;
  const { grossAmount, currency, professionalId } = req.body as { grossAmount: number; currency: Currency; professionalId: string };
  if (!grossAmount || grossAmount <= 0) {
    throw new HttpError(400, 'grossAmount must be greater than zero');
  }

  const platformFeeRate = 0.05;
  const platformFee = grossAmount * platformFeeRate;
  const netAmount = grossAmount - platformFee;

  const wallet = getWallet(userId);
  wallet.balances[currency].available += netAmount;

  const commissionEntry: LedgerEntry = {
    id: `commission-${Date.now()}`,
    type: 'commission',
    amount: -platformFee,
    currency,
    description: 'Taxa plataforma',
    createdAt: new Date().toISOString(),
  };
  const settlementEntry: LedgerEntry = {
    id: `settlement-${Date.now()}`,
    type: 'settlement',
    amount: netAmount,
    currency,
    description: `Repasse para profissional ${professionalId}`,
    createdAt: new Date().toISOString(),
  };
  wallet.ledger.unshift(settlementEntry, commissionEntry);

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

fintechRouter.get('/reports/daily', (req, res) => {
  const userId = req.query.userId as string | undefined;
  const wallet = userId ? getWallet(userId) : undefined;
  const ledger = wallet?.ledger ?? [];
  const totals = ledger.reduce(
    (acc, entry) => {
      if (entry.currency !== 'BRL') return acc;
      acc[entry.type] = (acc[entry.type] ?? 0) + entry.amount;
      return acc;
    },
    {} as Record<LedgerEntry['type'], number>,
  );

  res.json({
    date: new Date().toISOString().slice(0, 10),
    totals,
  });
});

fintechRouter.get('/reports/transactions', (_req, res) => {
  res.json({
    filters: { range: 'month', currency: 'BRL' },
    transactions: [
      { id: 'txn-10', type: 'payment', amount: 1200, currency: 'BRL', description: 'Workshop fotografia', createdAt: new Date().toISOString() },
      { id: 'txn-11', type: 'commission', amount: -60, currency: 'BRL', description: '5% plataforma', createdAt: new Date().toISOString() },
      { id: 'txn-12', type: 'transfer', amount: -300, currency: 'MCOIN', description: 'Pagamento em coins', createdAt: new Date().toISOString() },
    ] as LedgerEntry[],
  });
});
