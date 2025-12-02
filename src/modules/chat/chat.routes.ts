import { Router } from 'express';

export type ChatInstruction = {
  professionalId: string;
  instructions: string;
  lastUpdated: string;
};

export type ChatMessage = {
  clientId: string;
  message: string;
};

export const chatRouter = Router();

const defaultInstruction = (professionalId: string): ChatInstruction => ({
  professionalId,
  instructions:
    'Bem-vindo ao estúdio! Sou o assistente virtual do profissional. Compartilhe seu evento, orçamento e prazos que ajudo a montar o pacote ideal.',
  lastUpdated: new Date().toISOString(),
});

chatRouter.get('/professionals/:professionalId/instructions', (req, res) => {
  const { professionalId } = req.params;
  const instructions: ChatInstruction = {
    professionalId,
    instructions: req.query.override as string | undefined ||
      'Apresentar portfólio, horários disponíveis, políticas de pagamento e diferenciais do profissional.',
    lastUpdated: new Date().toISOString(),
  };
  res.json(instructions);
});

chatRouter.put('/professionals/:professionalId/instructions', (req, res) => {
  const { professionalId } = req.params;
  const { instructions } = req.body as { instructions?: string };
  if (!instructions) {
    return res.status(400).json({ message: 'Instructions are required' });
  }
  const updated: ChatInstruction = {
    professionalId,
    instructions,
    lastUpdated: new Date().toISOString(),
  };
  res.json(updated);
});

chatRouter.post('/professionals/:professionalId/reset', (req, res) => {
  const { professionalId } = req.params;
  res.json(defaultInstruction(professionalId));
});

chatRouter.post('/professionals/:professionalId/messages', (req, res) => {
  const { professionalId } = req.params;
  const { clientId, message } = req.body as ChatMessage;

  if (!clientId || !message) {
    return res.status(400).json({ message: 'clientId and message are required' });
  }

  const prompt = `Instruções do profissional ${professionalId}: oferecer pacotes, formas de pagamento, upsell de álbuns, com resposta cordial.`;
  const reply = `Instrucao aplicada: ${prompt}. Mensagem do cliente: ${message}. Resposta da IA: preparei orçamento com opções premium e econômicas.`;

  res.json({
    professionalId,
    clientId,
    prompt,
    reply,
    auditLogId: `log-${Date.now()}`,
    leadQualification: { score: 85, status: 'warm', nextAction: 'Enviar proposta e link de pagamento' },
  });
});

chatRouter.get('/professionals/:professionalId/logs', (req, res) => {
  const { professionalId } = req.params;
  res.json({
    professionalId,
    logs: [
      {
        id: 'log-1',
        clientId: 'client-123',
        transcript: [
          { from: 'client', message: 'Preciso de fotos para casamento' },
          { from: 'bot', message: 'Temos pacotes com drone e álbum. Qual a data?' },
        ],
        classification: 'hot',
        conversion: { status: 'proposal-sent', amount: 3200 },
      },
    ],
    metrics: {
      avgResponseTimeMs: 1200,
      hotLeadRate: 0.24,
      satisfaction: 4.7,
    },
  });
});
