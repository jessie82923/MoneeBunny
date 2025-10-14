import { Router } from 'express';
import userController from '../controllers/userController';

const router = Router();

// Route to get user profile
router.get('/:id', userController.getUserProfile.bind(userController));

// Route to update user profile
router.put('/:id', userController.updateUserProfile.bind(userController));

export default router;