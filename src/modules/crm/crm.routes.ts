import { Router } from 'express';

export type LeadStatus = 'new' | 'cold' | 'warm' | 'hot' | 'closed';
export type Stage = 'novo' | 'frio' | 'morno' | 'quente' | 'fechado';

export const crmRouter = Router();

crmRouter.get('/leads', (_req, res) => {
  res.json({
    leads: [
      {
        id: 'lead-1',
        email: 'cliente@example.com',
        status: 'warm' as LeadStatus,
        score: 78,
        channel: 'chat-ia',
        transcriptId: 'log-1',
      },
    ],
  });
});

crmRouter.post('/leads', (req, res) => {
  const lead = req.body as { email: string; notes?: string; professionalId: string };
  res.status(201).json({ id: 'lead-new', ...lead, status: 'new' });
});

crmRouter.post('/leads/:id/classify', (req, res) => {
  const { id } = req.params;
  const { transcript, profile } = req.body as { transcript?: string; profile?: Record<string, unknown> };
  const classification: LeadStatus = transcript?.includes('pagamento') ? 'hot' : 'warm';

  res.json({
    id,
    classification,
    reason: classification === 'hot' ? 'Cliente mencionou pagamento imediato' : 'Interesse moderado identificado pela IA',
    profile,
    nextAction:
      classification === 'hot'
        ? 'Enviar mensagem WhatsApp com link de pagamento'
        : 'Adicionar à campanha de nutrição quinzenal',
  });
});

crmRouter.get('/pipeline', (_req, res) => {
  res.json({
    stages: [
      { id: 'novo', label: 'Novo', count: 12 },
      { id: 'frio', label: 'Frio', count: 20 },
      { id: 'morno', label: 'Morno', count: 15 },
      { id: 'quente', label: 'Quente', count: 8 },
      { id: 'fechado', label: 'Fechado', count: 30 },
    ],
    conversion: {
      warmToHot: 0.34,
      hotToClosed: 0.62,
      avgTimeInStageDays: {
        novo: 2,
        frio: 10,
        morno: 7,
        quente: 3,
      },
    },
  });
});

crmRouter.post('/pipeline/:leadId/move', (req, res) => {
  const { leadId } = req.params;
  const { targetStage } = req.body as { targetStage: Stage; triggerWhatsApp?: boolean };

  res.json({
    leadId,
    targetStage,
    whatsappDispatched: targetStage === 'quente' || req.body.triggerWhatsApp === true,
    paymentLink: targetStage === 'quente' ? 'https://pay.example.com/checkout/leadId' : undefined,
  });
});

crmRouter.post('/campaigns', (req, res) => {
  const { title, audience } = req.body as { title: string; audience: Stage[]; schedule: string };
  res.status(201).json({
    id: `camp-${Date.now()}`,
    title,
    audience,
    status: 'scheduled',
  });
});

crmRouter.get('/campaigns/templates', (_req, res) => {
  res.json({
    templates: [
      { id: 'tmp-1', channel: 'email', content: 'Template de orçamento com desconto', variables: ['nome', 'evento'] },
      { id: 'tmp-2', channel: 'whatsapp', content: 'Mensagem quente com link de pagamento', variables: ['linkPagamento'] },
    ],
  });
});

crmRouter.get('/interactions/:leadId', (req, res) => {
  const { leadId } = req.params;
  res.json({
    leadId,
    interactions: [
      { id: 'int-1', channel: 'whatsapp', status: 'delivered', sentAt: '2025-12-01T12:00:00Z' },
      { id: 'int-2', channel: 'sms', status: 'scheduled', sendAt: '2025-12-05T12:00:00Z' },
    ],
  });
});
