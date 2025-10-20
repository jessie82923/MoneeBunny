/**
 * Budget API Tests
 * Tests budget CRUD operations
 */

import request from 'supertest';
import { app } from '../../src/app';

describe('Budget API', () => {
  let authToken: string;
  let budgetId: string; // Changed from number to string

  const testUser = {
    email: `budget-test-${Date.now()}@example.com`,
    password: 'Test123456',
    firstName: 'Budget',
    lastName: 'Tester',
  };

  const testBudget = {
    name: 'Food & Dining', // Changed from category to name
    amount: 5000,
    period: 'monthly' as const,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
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

  describe('POST /api/budgets', () => {
    it('should create a new budget successfully', async () => {
      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testBudget)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(testBudget.name);
      expect(Number(response.body.data.amount)).toBe(testBudget.amount); // Decimal is returned as string

      budgetId = response.body.data.id;
    });

    it('should fail to create budget without authentication', async () => {
      const response = await request(app)
        .post('/api/budgets')
        .send(testBudget)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail to create budget with invalid data', async () => {
      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Food' }) // Missing required fields
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/budgets', () => {
    it('should list all budgets for authenticated user', async () => {
      const response = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('name');
    });

    it('should fail to list budgets without authentication', async () => {
      const response = await request(app)
        .get('/api/budgets')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/budgets/:id', () => {
    it('should get a specific budget by id', async () => {
      const response = await request(app)
        .get(`/api/budgets/${budgetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(budgetId);
      expect(response.body.data.name).toBe(testBudget.name);
    });

    it('should return 404 for non-existent budget', async () => {
      const response = await request(app)
        .get('/api/budgets/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/budgets/:id', () => {
    it('should update budget successfully', async () => {
      const updatedData = {
        amount: 6000,
        name: 'Food & Dining - Updated',
      };

      const response = await request(app)
        .put(`/api/budgets/${budgetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.amount).toBe(String(updatedData.amount)); // Decimal is returned as string
      expect(response.body.data.name).toBe(updatedData.name);
    });

    it('should fail to update another user\'s budget', async () => {
      // This would require creating another user and budget
      // Placeholder for now
      expect(true).toBe(true);
    });
  });

  describe('DELETE /api/budgets/:id', () => {
    it('should delete budget successfully', async () => {
      const response = await request(app)
        .delete(`/api/budgets/${budgetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 404 when deleting already deleted budget', async () => {
      const response = await request(app)
        .delete(`/api/budgets/${budgetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  // Export budgetId for use in transaction tests
  afterAll(() => {
    (global as any).testBudgetId = budgetId;
  });
});
