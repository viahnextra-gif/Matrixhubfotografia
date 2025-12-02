import { Router } from 'express';
import { HttpError } from '../../types/http-error';

export type ChatInstruction = {
  professionalId: string;
  instructions: string;
  lastUpdated: string;
};

export type ChatMessage = {
  clientId: string;
  message: string;
};

export type ChatLog = {
  id: string;
  professionalId: string;
  clientId: string;
  prompt: string;
  reply: string;
  leadQualification: {
    score: number;
    status: 'cold' | 'warm' | 'hot';
    nextAction: string;
  };
  createdAt: string;
};

export const chatRouter = Router();

const instructionStore = new Map<string, ChatInstruction>();
const logsStore = new Map<string, ChatLog[]>();

const defaultInstruction = (professionalId: string): ChatInstruction => ({
  professionalId,
  instructions:
    'Bem-vindo ao estúdio! Sou o assistente virtual do profissional. Compartilhe evento, orçamento e prazos para sugerirmos o pacote ideal com formas de pagamento.',
  lastUpdated: new Date().toISOString(),
});

const getInstruction = (professionalId: string): ChatInstruction => {
  if (!instructionStore.has(professionalId)) {
    instructionStore.set(professionalId, defaultInstruction(professionalId));
  }
  return instructionStore.get(professionalId)!;
};

chatRouter.get('/professionals/:professionalId/instructions', (req, res) => {
  const { professionalId } = req.params;
  res.json(getInstruction(professionalId));
});

chatRouter.put('/professionals/:professionalId/instructions', (req, res) => {
  const { professionalId } = req.params;
  const { instructions } = req.body as { instructions?: string };

  if (!instructions || instructions.trim().length < 10) {
    throw new HttpError(400, 'Instructions must include guidance for the bot with at least 10 characters');
  }

  const updated: ChatInstruction = {
    professionalId,
    instructions: instructions.trim(),
    lastUpdated: new Date().toISOString(),
  };

  instructionStore.set(professionalId, updated);
  res.json(updated);
});

chatRouter.post('/professionals/:professionalId/reset', (req, res) => {
  const { professionalId } = req.params;
  const resetValue = defaultInstruction(professionalId);
  instructionStore.set(professionalId, resetValue);
  res.json(resetValue);
});

chatRouter.post('/professionals/:professionalId/messages', (req, res) => {
  const { professionalId } = req.params;
  const { clientId, message } = req.body as ChatMessage;

  if (!clientId || !message) {
    throw new HttpError(400, 'clientId and message are required');
  }

  const instruction = getInstruction(professionalId);
  const prompt = `Contexto do bot: ${instruction.instructions}`;
  const reply = `(${professionalId}) IA respondeu com base nas instruções e mensagem: ${message}`;

  const leadQualification: ChatLog['leadQualification'] =
    message.toLowerCase().includes('pagamento') || message.toLowerCase().includes('pix')
      ? { score: 92, status: 'hot', nextAction: 'Gerar link de pagamento e enviar via WhatsApp' }
      : { score: 76, status: 'warm', nextAction: 'Inserir em campanha de nutrição quinzenal' };

  const log: ChatLog = {
    id: `log-${Date.now()}`,
    professionalId,
    clientId,
    prompt,
    reply,
    leadQualification,
    createdAt: new Date().toISOString(),
  };

  const existing = logsStore.get(professionalId) ?? [];
  logsStore.set(professionalId, [log, ...existing]);

  res.status(201).json({ ...log, transcript: [{ from: 'client', message }, { from: 'bot', message: reply }] });
});

chatRouter.get('/professionals/:professionalId/logs', (req, res) => {
  const { professionalId } = req.params;
  const logs = logsStore.get(professionalId) ?? [];

  const metrics = {
    totalConversations: logs.length,
    avgResponseTimeMs: 1200,
    hotLeadRate:
      logs.length === 0 ? 0 : Number((logs.filter((log) => log.leadQualification.status === 'hot').length / logs.length).toFixed(2)),
    satisfaction: 4.7,
  };

  res.json({ professionalId, logs, metrics });
});
