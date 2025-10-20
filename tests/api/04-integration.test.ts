/**
 * Integration Tests
 * Tests complete user flow: register → login → create budget → add transaction
 */

import request from 'supertest';
import { app } from '../../src/app';

describe('Integration: Complete User Flow', () => {
  const timestamp = Date.now();
  const testUser = {
    email: `integration${timestamp}@example.com`,
    password: 'Integration123',
    firstName: 'Integration',
    lastName: 'Test',
  };

  let authToken: string;
  let userId: string; // Changed from number to string
  let budgetId: string; // Changed from number to string
  let transactionId: string; // Changed from number to string

  it('Step 1: User should register successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(testUser)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe(testUser.email);
    userId = response.body.data.id;

    console.log(`✅ User registered: ${testUser.email}`);
  });

  it('Step 2: User should login successfully', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('token');
    authToken = response.body.data.token;

    console.log('✅ User logged in successfully');
  });

  it('Step 3: User should create a monthly food budget', async () => {
    const budget = {
      name: 'Food & Dining', // Changed from category to name
      amount: 10000,
      period: 'monthly',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
    };

    const response = await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${authToken}`)
      .send(budget)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe(budget.name);
    expect(Number(response.body.data.amount)).toBe(budget.amount); // Decimal is returned as string
    budgetId = response.body.data.id;

    console.log(`✅ Budget created: ${budget.name} - NT$${budget.amount}`);
  });

  it('Step 4: User should list all budgets', async () => {
    const response = await request(app)
      .get('/api/budgets')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);

    const createdBudget = response.body.data.find((b: any) => b.id === budgetId);
    expect(createdBudget).toBeDefined();

    console.log(`✅ Listed ${response.body.data.length} budget(s)`);
  });

  it('Step 5: User should add an expense transaction', async () => {
    const transaction = {
      type: 'expense',
      category: 'Food',
      amount: 350,
      description: 'Lunch at Italian restaurant',
      date: new Date('2024-01-15'),
      budgetId,
    };

    const response = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .send(transaction)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.type).toBe(transaction.type);
    expect(Number(response.body.data.amount)).toBe(transaction.amount); // Decimal is returned as string
    expect(response.body.data.budgetId).toBe(budgetId);
    transactionId = response.body.data.id;

    console.log(`✅ Transaction added: ${transaction.description} - NT$${transaction.amount}`);
  });

  it('Step 6: User should add an income transaction', async () => {
    const transaction = {
      type: 'income',
      category: 'Salary',
      amount: 50000,
      description: 'Monthly salary',
      date: new Date('2024-01-01'),
    };

    const response = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .send(transaction)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.type).toBe('income');

    console.log(`✅ Income added: ${transaction.description} - NT$${transaction.amount}`);
  });

  it('Step 7: User should list all transactions', async () => {
    const response = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThanOrEqual(2); // At least 2 transactions

    const expenseTransaction = response.body.data.find((t: any) => t.id === transactionId);
    expect(expenseTransaction).toBeDefined();

    console.log(`✅ Listed ${response.body.data.length} transaction(s)`);
  });

  it('Step 8: User should view a specific transaction', async () => {
    const response = await request(app)
      .get(`/api/transactions/${transactionId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(transactionId);

    console.log('✅ Transaction details retrieved');
  });

  it('Step 9: User should update the transaction', async () => {
    const updatedData = {
      amount: 400,
      description: 'Updated: Lunch at Italian restaurant (with dessert)',
    };

    const response = await request(app)
      .put(`/api/transactions/${transactionId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatedData)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.amount).toBe(String(updatedData.amount)); // Decimal is returned as string

    console.log('✅ Transaction updated');
  });

  it('Step 10: User should view their profile', async () => {
    const response = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe(testUser.email);
    expect(response.body.data.id).toBe(userId);

    console.log('✅ User profile retrieved');
  });

  it('Step 11: User should update their profile', async () => {
    const updatedProfile = {
      firstName: 'Updated',
      lastName: 'Name',
    };

    const response = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatedProfile)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.firstName).toBe(updatedProfile.firstName);

    console.log('✅ User profile updated');
  });

  // Summary
  afterAll(() => {
    console.log('\n========================================');
    console.log('🎉 Integration Test Flow Completed!');
    console.log('========================================');
    console.log(`User: ${testUser.email}`);
    console.log(`Budget ID: ${budgetId}`);
    console.log(`Transaction ID: ${transactionId}`);
    console.log('========================================\n');
  });
});
