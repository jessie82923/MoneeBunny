import { Router } from 'express';
import authController from '../controllers/authController';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema } from '../validators';

const router = Router();

// Register
router.post('/register', validate(registerSchema), (req, res) => authController.register(req, res));

// Login
router.post('/login', validate(loginSchema), (req, res) => authController.login(req, res));

// Logout
router.post('/logout', (req, res) => authController.logout(req, res));

export default router;