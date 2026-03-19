const request = require('supertest');
const app = require('../backend/server'); // The exported express app
const mongoose = require('mongoose');
const User = require('../backend/models/usermodels');

// Mock specific database calls to prevent actual DB modification during tests
jest.mock('../backend/models/usermodels');
jest.mock('../backend/config/db', () => jest.fn()); // Mock db connection

describe('Auth API Integration Tests', () => {

    beforeAll(() => {
        // Setup mock environment
        process.env.JWT_SECRET = 'test_secret_for_jest';
    });

    afterAll(async () => {
        // Cleanup mocks
        jest.restoreAllMocks();
    });

    describe('POST /login', () => {
        it('should return error if email or password is missing', async () => {
            const res = await request(app)
                .post('/login')
                .send({ email: 'test@test.com' });
            
            expect(res.text).toBe('Email and password are required');
        });

        it('should return User not found if email does not exist', async () => {
            User.findOne.mockResolvedValueOnce(null);

            const res = await request(app)
                .post('/login')
                .send({ email: 'fake@fake.com', password: 'password123' });
            
            expect(res.text).toBe('User not found');
            expect(User.findOne).toHaveBeenCalledWith({ email: 'fake@fake.com' });
        });
    });

    describe('POST /register', () => {
        it('should return error for invalid email format', async () => {
            const res = await request(app)
                .post('/register')
                .send({ name: 'John', email: 'not-an-email', password: 'password123' });
            
            expect(res.text).toBe('Invalid email format');
        });

        it('should return User already exists if duplicate', async () => {
            User.findOne.mockResolvedValueOnce({ email: 'exist@test.com' });

            const res = await request(app)
                .post('/register')
                .send({ name: 'John', email: 'exist@test.com', password: 'password123' });
            
            expect(res.text).toBe('User already exists');
        });
    });

    describe('GET /logout', () => {
        it('should clear the token cookie and redirect', async () => {
            const res = await request(app).get('/logout');
            
            expect(res.statusCode).toBe(302); // Redirect to /
            expect(res.headers['set-cookie'][0]).toMatch(/token=;/); // Cookie cleared
        });
    });
});
