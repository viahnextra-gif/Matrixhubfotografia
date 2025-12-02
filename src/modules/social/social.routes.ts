import { Router } from 'express';

export const socialRouter = Router();

socialRouter.get('/posts', (_req, res) => {
  res.json({
    posts: [
      { id: 'post-1', authorId: 'user-1', mediaUrl: 'https://cdn.example.com/p1.jpg', likes: 12 },
    ],
  });
});

socialRouter.post('/posts', (req, res) => {
  res.status(201).json({
    id: 'post-new',
    ...req.body,
    status: 'published',
  });
});

socialRouter.post('/posts/:id/like', (req, res) => {
  res.json({ id: req.params.id, likedBy: req.body.userId, likes: 13 });
});
