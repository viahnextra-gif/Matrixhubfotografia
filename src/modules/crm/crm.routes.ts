import { Router } from 'express';
import { HttpError } from '../../types/http-error';

export type LeadStatus = 'new' | 'cold' | 'warm' | 'hot' | 'closed';
export type Stage = 'novo' | 'frio' | 'morno' | 'quente' | 'fechado';

export type Lead = {
  id: string;
  email: string;
  professionalId: string;
  status: LeadStatus;
  score: number;
  channel: string;
  transcriptId?: string;
  history: Array<{ channel: 'email' | 'sms' | 'whatsapp' | 'chat-ia'; message: string; sentAt: string }>;
};

const leads: Lead[] = [
  {
    id: 'lead-1',
    email: 'cliente@example.com',
    professionalId: 'pro-1',
    status: 'warm',
    score: 78,
    channel: 'chat-ia',
    transcriptId: 'log-1',
    history: [],
  },
];

const pipelineStages: Stage[] = ['novo', 'frio', 'morno', 'quente', 'fechado'];

export const crmRouter = Router();

const classifyLead = (transcript?: string): LeadStatus => {
  if (!transcript) return 'new';
  if (transcript.toLowerCase().includes('pagar') || transcript.toLowerCase().includes('pix')) {
    return 'hot';
  }
  if (transcript.toLowerCase().includes('preço') || transcript.toLowerCase().includes('valor')) {
    return 'warm';
  }
  return 'cold';
};

crmRouter.get('/leads', (_req, res) => {
  res.json({ leads });
});

crmRouter.post('/leads', (req, res) => {
  const lead = req.body as { email: string; notes?: string; professionalId: string; transcript?: string };
  if (!lead.email || !lead.professionalId) {
    throw new HttpError(400, 'email and professionalId are required');
  }
  const status = classifyLead(lead.transcript);
  const created: Lead = {
    id: `lead-${Date.now()}`,
    email: lead.email,
    professionalId: lead.professionalId,
    status,
    score: status === 'hot' ? 92 : status === 'warm' ? 76 : 40,
    channel: 'chat-ia',
    transcriptId: lead.transcript ? `log-${Date.now()}` : undefined,
    history: [],
  };
  leads.unshift(created);
  res.status(201).json(created);
});

crmRouter.post('/leads/:id/classify', (req, res) => {
  const { id } = req.params;
  const { transcript, profile } = req.body as { transcript?: string; profile?: Record<string, unknown> };
  const classification: LeadStatus = classifyLead(transcript);

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
  const stageCounts = pipelineStages.map((stage) => ({
    id: stage,
    label: stage.charAt(0).toUpperCase() + stage.slice(1),
    count: leads.filter((lead) => lead.status === translateStage(stage)).length,
  }));

  res.json({
    stages: stageCounts,
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
  const { targetStage, triggerWhatsApp } = req.body as { targetStage: Stage; triggerWhatsApp?: boolean };

  if (!pipelineStages.includes(targetStage)) {
    throw new HttpError(400, 'Invalid target stage');
  }

  const lead = leads.find((item) => item.id === leadId);
  if (!lead) {
    throw new HttpError(404, 'Lead not found');
  }

  lead.status = translateStage(targetStage);
  const whatsappDispatched = lead.status === 'hot' || triggerWhatsApp === true;

  res.json({
    leadId,
    targetStage,
    whatsappDispatched,
    paymentLink: targetStage === 'quente' ? 'https://pay.example.com/checkout/leadId' : undefined,
  });
});

crmRouter.post('/campaigns', (req, res) => {
  const { title, audience, schedule } = req.body as { title: string; audience: Stage[]; schedule: string };
  if (!title || !audience?.length || !schedule) {
    throw new HttpError(400, 'title, audience and schedule are required');
  }
  res.status(201).json({
    id: `camp-${Date.now()}`,
    title,
    audience,
    schedule,
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
  const lead = leads.find((item) => item.id === leadId);
  if (!lead) {
    throw new HttpError(404, 'Lead not found');
  }
  res.json({
    leadId,
    interactions: lead.history,
  });
});

crmRouter.post('/interactions/:leadId', (req, res) => {
  const { leadId } = req.params;
  const { channel, message } = req.body as { channel: Lead['history'][number]['channel']; message: string };
  const lead = leads.find((item) => item.id === leadId);

  if (!lead) {
    throw new HttpError(404, 'Lead not found');
  }
  if (!channel || !message) {
    throw new HttpError(400, 'channel and message are required');
  }

  const interaction = { channel, message, sentAt: new Date().toISOString() };
  lead.history.unshift(interaction);

  res.status(201).json({ leadId, interaction });
});

const translateStage = (stage: Stage): LeadStatus => {
  switch (stage) {
    case 'novo':
      return 'new';
    case 'frio':
      return 'cold';
    case 'morno':
      return 'warm';
    case 'quente':
      return 'hot';
    case 'fechado':
      return 'closed';
    default:
      return 'new';
  }
};
