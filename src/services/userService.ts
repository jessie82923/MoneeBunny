import prisma from '../config/database';
import { User, Prisma } from '@prisma/client';

class UserService {
    async createUser(userData: Prisma.UserCreateInput): Promise<User> {
        return await prisma.user.create({
            data: userData
        });
    }

    async getUserById(userId: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { id: userId }
        });
    }

    async updateUser(userId: string, updateData: Prisma.UserUpdateInput): Promise<User | null> {
        return await prisma.user.update({
            where: { id: userId },
            data: updateData
        });
    }

    async deleteUser(userId: string): Promise<User | null> {
        return await prisma.user.delete({
            where: { id: userId }
        });
    }

    async getAllUsers(): Promise<User[]> {
        return await prisma.user.findMany();
    }
}

export default new UserService();