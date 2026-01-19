import { Router } from 'express';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';
import { getOrCreateUserByAuth, getUserByAuthId } from '../repositories/users.js';

const router = Router();

// Get current user profile (creates user if doesn't exist)
router.get('/me', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest;

  if (!authReq.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  try {
    const user = await getOrCreateUserByAuth({
      authId: authReq.user.id,
      email: authReq.user.email || '',
    });

    res.json({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export { router as usersRouter };
