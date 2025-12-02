import { Router } from 'express';
import { HttpError } from '../../types/http-error';

export const authRouter = Router();

authRouter.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new HttpError(400, 'Email and password are required');
  }
  res.status(201).json({ message: 'User registered', email });
});

authRouter.post('/login', (req, res) => {
  const { email } = req.body;
  res.json({ message: 'Login successful', email, token: 'jwt-placeholder' });
});

authRouter.get('/profiles/:id', (req, res) => {
  res.json({
    id: req.params.id,
    roles: ['user'],
    kycStatus: 'pending',
    kycAlert: 'Envie documentos para liberar pagamentos e saques',
    contact: {
      email: 'cliente@example.com',
      phone: '+55 11 98888-7777',
    },
    professional: {
      active: true,
      chatInstruction: 'Destacar diferenciais e políticas de pagamento antecipado',
      portfolioEnabled: true,
      contactsRequired: ['phone', 'instagram'],
    },
  });
});

authRouter.post('/profiles/:id/kyc', (req, res) => {
  res.json({ id: req.params.id, status: 'submitted', provider: req.body.provider ?? 'manual' });
});
