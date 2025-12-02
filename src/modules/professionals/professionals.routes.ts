import { Router } from 'express';
import { HttpError } from '../../types/http-error';

export type ContactFields = {
  phone?: string;
  email?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  whatsapp?: string;
};

export type ContactData = ContactFields & {
  publicFields: Array<keyof ContactFields>;
};

export type PortfolioItem = {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: 'photo' | 'video';
  tags: string[];
};

export type FinancialSnapshot = {
  professionalId: string;
  balances: {
    brl: { available: number; pending: number };
    mcoin: { available: number; pending: number };
  };
  commissions: {
    month: string;
    grossSales: number;
    platformFee: number;
    platformFeeAmount: number;
    netRevenue: number;
  };
  breakdown: {
    products: number;
    services: number;
    courses: number;
  };
};

export const professionalsRouter = Router();

const contactsStore = new Map<string, ContactData>();
const portfolioStore = new Map<string, PortfolioItem[]>();

const defaultContacts = (): ContactData => ({
  phone: '+55 11 98888-7777',
  email: 'pro@example.com',
  website: 'https://estudio-fotos.com',
  instagram: '@estudiofotos',
  whatsapp: '+55 11 98888-7777',
  publicFields: ['phone', 'instagram', 'website', 'whatsapp'],
});

const basePortfolio: PortfolioItem[] = [
  {
    id: 'pf-1',
    title: 'Casamento Ana & João',
    description: 'Cobertura completa com álbum premium e drone',
    mediaUrl: 'https://cdn.example.com/portfolio/casamento-ana-joao.jpg',
    mediaType: 'photo',
    tags: ['casamento', 'drone', 'álbum'],
  },
];

const getPortfolio = (id: string): PortfolioItem[] => {
  if (!portfolioStore.has(id)) {
    portfolioStore.set(id, basePortfolio);
  }
  return portfolioStore.get(id)!;
};

const getContacts = (id: string): ContactData => {
  if (!contactsStore.has(id)) {
    contactsStore.set(id, defaultContacts());
  }
  return contactsStore.get(id)!;
};

professionalsRouter.get('/:id/profile', (req, res) => {
  const { id } = req.params;
  res.json({
    id,
    specialties: ['casamentos', 'eventos corporativos'],
    contact: getContacts(id),
    portfolio: getPortfolio(id),
    chatInstruction: 'Apresente pacotes com foco em emoção, prazo e pagamento facilitado.',
    kycPending: true,
  });
});

professionalsRouter.get('/:id/portfolio', (req, res) => {
  const { id } = req.params;
  res.json({ professionalId: id, portfolio: getPortfolio(id) });
});

professionalsRouter.post('/:id/portfolio', (req, res) => {
  const { id } = req.params;
  const item = req.body as PortfolioItem;

  if (!item.title || !item.mediaUrl || !item.mediaType) {
    throw new HttpError(400, 'title, mediaUrl and mediaType are required');
  }

  const existing = getPortfolio(id);
  const created = { ...item, id: item.id ?? `pf-${Date.now()}` };
  portfolioStore.set(id, [created, ...existing]);
  res.status(201).json({ professionalId: id, portfolio: created });
});

professionalsRouter.put('/:id/contacts', (req, res) => {
  const { id } = req.params;
  const contact = req.body as ContactData;
  if (!contact.publicFields?.length) {
    throw new HttpError(400, 'publicFields must specify which contacts are visible');
  }

  const updated: ContactData = { ...contact };
  contactsStore.set(id, updated);
  res.json({ professionalId: id, contact: updated });
});

professionalsRouter.get('/:id/dashboard', (req, res) => {
  const { id } = req.params;
  const snapshot: FinancialSnapshot = {
    professionalId: id,
    balances: {
      brl: { available: 12450.5, pending: 2300 },
      mcoin: { available: 9800, pending: 500 },
    },
    commissions: {
      month: '2025-12',
      grossSales: 48200,
      platformFee: 0.05,
      platformFeeAmount: 2410,
      netRevenue: 45790,
    },
    breakdown: {
      products: 0.35,
      services: 0.45,
      courses: 0.2,
    },
  };

  res.json(snapshot);
});
