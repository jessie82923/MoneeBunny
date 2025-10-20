/// <reference path="../types/express.d.ts" />
import type { Request, Response } from 'express';
import UserService from '../services/userService';
import type { ApiResponse } from '../types';

export class UserController {
  /**
   * Get current authenticated user's profile.
   * @param req - Express request with authenticated user
   * @param res - Express response
   */
  async getCurrentUserProfile(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        } satisfies ApiResponse);
      }

      const userProfile = await UserService.getUserById(req.userId);

      if (!userProfile) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        } satisfies ApiResponse);
      }

      return res.status(200).json({
        success: true,
        data: userProfile,
      } satisfies ApiResponse);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Error fetching user profile';

      return res.status(500).json({
        success: false,
        error: errorMessage,
      } satisfies ApiResponse);
    }
  }

  /**
   * Update current authenticated user's profile.
   * @param req - Express request with authenticated user and update data
   * @param res - Express response
   */
  async updateCurrentUserProfile(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        } satisfies ApiResponse);
      }

      const updatedData = req.body;
      const updatedUser = await UserService.updateUser(req.userId, updatedData);

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        } satisfies ApiResponse);
      }

      return res.status(200).json({
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully',
      } satisfies ApiResponse);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Error updating user profile';

      return res.status(500).json({
        success: false,
        error: errorMessage,
      } satisfies ApiResponse);
    }
  }

  /**
   * Fetch user profile information by ID (admin functionality).
   * @param req - Express request with user ID in params
   * @param res - Express response
   */
  async getUserProfile(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.params.id;
      const userProfile = await UserService.getUserById(userId); 
      
      if (!userProfile) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        } satisfies ApiResponse);
      }
      
      return res.status(200).json({
        success: true,
        data: userProfile,
      } satisfies ApiResponse);
    } catch (error) {
      // 明確處理 unknown 錯誤
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error fetching user profile';
      
      return res.status(500).json({
        success: false,
        error: errorMessage,
      } satisfies ApiResponse);
    }
  }

  /**
   * Update user profile information by ID (admin functionality).
   * @param req - Express request with user ID and update data
   * @param res - Express response
   */
  async updateUserProfile(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.params.id; // 推斷為 string
      const updatedData = req.body; // 應該在 middleware 驗證類型
      
      const updatedUser = await UserService.updateUser(userId, updatedData);
      
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        } satisfies ApiResponse);
      }
      
      return res.status(200).json({
        success: true,
        data: updatedUser,
      } satisfies ApiResponse);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Error updating user profile';
      
      return res.status(500).json({
        success: false,
        error: errorMessage,
      } satisfies ApiResponse);
    }
  }
}

export default new UserController();