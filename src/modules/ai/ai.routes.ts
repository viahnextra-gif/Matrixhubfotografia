import { Router } from 'express';

export const aiRouter = Router();

aiRouter.post('/generate', (req, res) => {
  res.json({
    prompt: req.body.prompt,
    type: req.body.type ?? 'text',
    result: 'placeholder-output',
  });
});

aiRouter.post('/recommendations', (req, res) => {
  res.json({
    context: req.body.context ?? 'feed',
    suggestions: ['#wedding', '#portrait'],
  });
});

aiRouter.post('/lead/score', (req, res) => {
  const { transcript } = req.body as { transcript: string };
  const score = transcript?.includes('pagamento') ? 92 : 70;
  const segment = score > 85 ? 'hot' : score > 75 ? 'warm' : 'cold';
  res.json({ score, segment, transcript });
});

aiRouter.post('/templates/suggest', (req, res) => {
  const { channel, goal } = req.body as { channel: 'email' | 'sms' | 'whatsapp'; goal: string };
  res.json({
    channel,
    goal,
    templates: [
      { title: 'Oferta especial', body: 'Olá {{nome}}, temos um pacote para {{evento}} com desconto de {{desconto}}.' },
      { title: 'Lembrete', body: 'Seguimos com agenda aberta para {{data}}. Posso enviar o link de pagamento?' },
    ],
  });
});

aiRouter.post('/summaries/chat', (req, res) => {
  const { transcript } = req.body as { transcript: string[] };
  res.json({
    summary: 'Cliente interessado em cobertura completa e pagamento via PIX.',
    keyQuestions: ['Qual a data do evento?', 'Quantidade de horas?', 'Entrega de álbum?'],
    transcript,
  });
});
