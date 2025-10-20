/// <reference path="../types/express.d.ts" />
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserService from '../services/userService';
import type { ApiResponse } from '../types';

class AuthController {
    /**
     * Register a new user.
     * @param req - Express request with user data in body
     * @param res - Express response
     */
    async register(req: Request, res: Response): Promise<Response> {
        try {
            const { email, password, firstName, lastName } = req.body;

            // Check if user already exists
            const existingUser = await UserService.getUserByEmail(email);
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    error: 'Email already registered',
                } satisfies ApiResponse);
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const newUser = await UserService.createUser({
                email,
                password: hashedPassword,
                firstName,
                lastName,
            });

            // Remove password from response
            const { password: _, ...userWithoutPassword } = newUser;

            return res.status(201).json({
                success: true,
                data: userWithoutPassword,
                message: 'User registered successfully',
            } satisfies ApiResponse);
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Error registering user';

            return res.status(500).json({
                success: false,
                error: errorMessage,
            } satisfies ApiResponse);
        }
    }

    /**
     * Login user and generate JWT token.
     * @param req - Express request with email and password in body
     * @param res - Express response
     */
    async login(req: Request, res: Response): Promise<Response> {
        try {
            const { email, password } = req.body;

            // Find user by email
            const user = await UserService.getUserByEmail(email);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid email or password',
                } satisfies ApiResponse);
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid email or password',
                } satisfies ApiResponse);
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                process.env.JWT_SECRET || 'your_jwt_secret_here',
                { expiresIn: '24h' }
            );

            // Remove password from response
            const { password: _, ...userWithoutPassword } = user;

            return res.status(200).json({
                success: true,
                data: {
                    user: userWithoutPassword,
                    token,
                },
                message: 'Login successful',
            } satisfies ApiResponse);
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Error logging in';

            return res.status(500).json({
                success: false,
                error: errorMessage,
            } satisfies ApiResponse);
        }
    }

    /**
     * Logout user (client-side token removal).
     * @param req - Express request
     * @param res - Express response
     */
    async logout(req: Request, res: Response): Promise<Response> {
        // In JWT-based auth, logout is typically handled client-side by removing the token
        // Server-side logout would require token blacklisting
        return res.status(200).json({
            success: true,
            message: 'Logout successful',
        } satisfies ApiResponse);
    }
}

export default new AuthController();