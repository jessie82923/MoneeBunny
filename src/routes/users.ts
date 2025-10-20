import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateProfileSchema } from '../validators';

const router = Router();
const userController = new UserController();

// All user routes require authentication
router.use(authenticate);

// Current user profile (must be before /:id to avoid route conflicts)
router.get('/me', (req, res) => userController.getCurrentUserProfile(req, res));
router.put('/me', validate(updateProfileSchema), (req, res) => userController.updateCurrentUserProfile(req, res));

// Specific user by ID (admin functionality)
router.get('/:id', (req, res) => userController.getUserProfile(req, res));
router.put('/:id', validate(updateProfileSchema), (req, res) => userController.updateUserProfile(req, res));

export default router;