import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET || 'your_secret_key';

interface JwtPayload {
  id: string;
  role?: string;
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }

    jwt.verify(token, secretKey, (err: Error | null, decoded: unknown) => {
        if (err) {
            res.status(403).json({ message: 'Failed to authenticate token' });
            return;
        }

        const payload = decoded as JwtPayload;
        req.userId = payload.id;
        req.userRole = payload.role;
        next();
    });
};

export const authorize = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        // Assuming user roles are stored in the request object
        const userRole = req.userRole; // This should be set during authentication

        if (!userRole || !roles.includes(userRole)) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }

        next();
    };
};