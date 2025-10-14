import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateBudget = [
    body('name').isString().notEmpty().withMessage('Budget name is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

export const validateTransaction = [
    body('description').isString().notEmpty().withMessage('Transaction description is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('budgetId').isString().notEmpty().withMessage('Budget ID is required'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

export const validateUser = [
    body('username').isString().notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];