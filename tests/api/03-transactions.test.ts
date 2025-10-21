/**
 * Transaction API Tests
 * Tests transaction CRUD operations
 */

import request from 'supertest';
import { app } from '../../src/app';

describe('Transaction API', () => {
  let authToken: string;
  let transactionId: string;

  const testUser = {
    email: `transaction-test-${Date.now()}@example.com`,
    password: 'Test123456',
    firstName: 'Transaction',
    lastName: 'Tester',
  };

  const testTransaction = {
    type: 'expense' as const,
    category: 'Food',
    amount: 150,
    description: 'Lunch at restaurant',
    date: new Date('2024-01-15'),
  };

  beforeAll(async () => {
    // Register a new user for testing
    await request(app)
      .post('/api/auth/register')
      .send(testUser);

    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    authToken = loginResponse.body.data.token;
  });

  describe('POST /api/transactions', () => {
    it('should create a new transaction successfully', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testTransaction)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.type).toBe(testTransaction.type);
      expect(Number(response.body.data.amount)).toBe(testTransaction.amount);

      transactionId = response.body.data.id;
    });

    it('should fail to create transaction without authentication', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .send(testTransaction)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail to create transaction with invalid data', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ type: 'expense' }) // Missing required fields
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/transactions', () => {
    it('should list all transactions for authenticated user', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('type');
    });

    it('should fail to list transactions without authentication', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/transactions/:id', () => {
    it('should get a specific transaction by id', async () => {
      const response = await request(app)
        .get(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(transactionId);
      expect(Number(response.body.data.amount)).toBe(testTransaction.amount); // Decimal is returned as string
    });

    it('should return 404 for non-existent transaction', async () => {
      const response = await request(app)
        .get('/api/transactions/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/transactions/:id', () => {
    it('should update transaction successfully', async () => {
      const updatedData = {
        amount: 200,
        description: 'Updated: Dinner at restaurant',
      };

      const response = await request(app)
        .put(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.amount).toBe(String(updatedData.amount)); // Decimal is returned as string
      expect(response.body.data.description).toBe(updatedData.description);
    });
  });

  describe('DELETE /api/transactions/:id', () => {
    it('should delete transaction successfully', async () => {
      const response = await request(app)
        .delete(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 404 when deleting already deleted transaction', async () => {
      const response = await request(app)
        .delete(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
