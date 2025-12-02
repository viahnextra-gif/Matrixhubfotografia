import { Router } from 'express';

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

export const professionalsRouter = Router();

professionalsRouter.get('/:id/profile', (req, res) => {
  const { id } = req.params;
  const contact: ContactData = {
    phone: '+55 11 98888-7777',
    email: 'pro@example.com',
    website: 'https://estudio-fotos.com',
    instagram: '@estudiofotos',
    whatsapp: '+55 11 98888-7777',
    publicFields: ['phone', 'instagram', 'website', 'whatsapp'],
  };

  const portfolio: PortfolioItem[] = [
    {
      id: 'pf-1',
      title: 'Casamento Ana & João',
      description: 'Cobertura completa com álbum premium e drone',
      mediaUrl: 'https://cdn.example.com/portfolio/casamento-ana-joao.jpg',
      mediaType: 'photo',
      tags: ['casamento', 'drone', 'álbum'],
    },
  ];

  res.json({
    id,
    specialties: ['casamentos', 'eventos corporativos'],
    contact,
    portfolio,
    chatInstruction: 'Apresente pacotes com foco em emoção, prazo e pagamento facilitado.',
    kycPending: true,
  });
});

professionalsRouter.post('/:id/portfolio', (req, res) => {
  const { id } = req.params;
  const item = req.body as PortfolioItem;

  if (!item.title || !item.mediaUrl || !item.mediaType) {
    return res.status(400).json({ message: 'title, mediaUrl and mediaType are required' });
  }

  const created = { ...item, id: item.id ?? `pf-${Date.now()}` };
  res.status(201).json({ professionalId: id, portfolio: created });
});

professionalsRouter.put('/:id/contacts', (req, res) => {
  const { id } = req.params;
  const contact = req.body as ContactData;
  if (!contact.publicFields?.length) {
    return res.status(400).json({ message: 'publicFields must specify which contacts are visible' });
  }

  res.json({ professionalId: id, contact });
});

professionalsRouter.get('/:id/dashboard', (req, res) => {
  const { id } = req.params;
  res.json({
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
  });
});
