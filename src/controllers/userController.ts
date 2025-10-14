import { Request, Response } from 'express';
import UserService from '../services/userService';

export class UserController {
    // Method to fetch user profile information
    async getUserProfile(req: Request, res: Response): Promise<Response> {
        try {
            const userId = req.params.id;
            // Logic to retrieve user profile from the database
            const userProfile = await UserService.getUserById(userId);
            return res.status(200).json(userProfile);
        } catch (error) {
            return res.status(500).json({ message: 'Error fetching user profile', error });
        }
    }

    // Method to update user profile information
    async updateUserProfile(req: Request, res: Response): Promise<Response> {
        try {
            const userId = req.params.id;
            const updatedData = req.body;
            // Logic to update user profile in the database
            const updatedUser = await UserService.updateUser(userId, updatedData);
            return res.status(200).json(updatedUser);
        } catch (error) {
            return res.status(500).json({ message: 'Error updating user profile', error });
        }
    }
}

export default new UserController();