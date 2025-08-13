import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import express, { response } from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import authRouter from '../../routes/auth.js'

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('bcrypt');
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

// Mock middleware - Updated to properly handle token verification
jest.mock('../../middleware/auth.js', () => ({
  authenticateToken: (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.sendStatus(401);
    
    // For testing purposes, we'll consider 'valid-token' as valid
    if (token === 'valid-token') {
      // Set the user object as it would be set by the real middleware
      req.user = { userId: 1, email: 'test@example.com' };
      next();
    } else {
      return res.sendStatus(403);
    }
  }
}));

describe('Auth Routes', () => {
  let app;
  let mockDb;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    mockDb = {
      data: {
        users: [
          {
            id: 1,
            name: 'Test',
            surname: 'User',
            email: 'test@example.com',
            password: 'hashedPassword123'
          }
        ]
      },
      read: jest.fn().mockResolvedValue(),
      write: jest.fn().mockResolvedValue()
    };

    app.use((req, res, next) => {
      req.db = mockDb;
      next();
    });

    app.use('/auth', authRouter);

    // Mock JWT and bcrypt functions
    jwt.sign = jest.fn().mockReturnValue('test-token');
    jwt.verify = jest.fn().mockImplementation((token, secret, callback) => {
      if (token === 'valid-token') {
        callback(null, { userId: 1, email: 'test@example.com' });
      } else {
        callback(new Error('Invalid token'), null);
      }
    });
    bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword123');
    bcrypt.compare = jest.fn().mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test for protected route
  describe('GET /protected', () => {
    it('should access protected route with valid token', async () => {
      const response = await request(app)
        .get('/auth/protected')
        .set('Authorization', 'Bearer valid-token');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'This is a protected route',
        user: { userId: 1, email: 'test@example.com' }
      });
    });
    
    it('should return 401 without token', async () => {
      const response = await request(app).get('/auth/protected');
      expect(response.status).toBe(401);
    });
    
    it('should return 403 with invalid token', async () => {
      const response = await request(app)
        .get('/auth/protected')
        .set('Authorization', 'Bearer invalid-token');
      
      expect(response.status).toBe(403);
    });
  });

  // Test for user registration
  describe('POST /register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'New',
        surname: 'User',
        email: 'new@example.com',
        password: 'password123'
      };
      
      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token', 'test-token');
      expect(response.body).toHaveProperty('userId', 2);
      expect(response.body).toHaveProperty('message', 'User registered successfully');

      expect(mockDb.data.users).toHaveLength(2);
      expect(mockDb.write).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(jwt.sign).toHaveBeenCalled();
    });
    
    it('should return 400 if user already exists', async () => {
      const userData = {
        name: 'Test',
        surname: 'User',
        email: 'test@example.com', // existing email
        password: 'password123'
      };
      
      const response = await request(app)
        .post('/auth/register')
        .send(userData);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'User already exists');
      expect(mockDb.data.users).toHaveLength(1);
      expect(mockDb.write).not.toHaveBeenCalled();
    });
  });

  describe('POST /login', () => {
    it('should login succesfully with valid credentials', async () => {
      const loginData = {
        email : 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token', 'test-token');
        expect(response.body).toHaveProperty('message', 'Zalogowano');
        expect(bcrypt.compare).toHaveBeenLastCalledWith('password123', 'hashedPassword123');
        expect(jwt.sign).toHaveBeenCalledWith(
          { userId: 1, email: 'test@example.com'},
          process.env.JWT_SECRET,
          { expiresIn :'1h' }
        );
    });
    it('should retour 401 if user does not exist', async () => {
      const loginData = {
        email: 'nonexidten@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData);


      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Błędne dane');
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return 401 if password is incorrect', async () => {
      bcrypt.compare.mockResolvedValue(false);

      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Błędne dane');
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedPassword123');
    });
  });
describe('PUT /edit/:id', () => {
  it('should update user successfully when authenticated', async () => {
    const updatedData = {
      name: 'Updated',
      surname: 'User',
      email: 'updated@example.com',
      password: 'newpassword'
    };

    const response = await request(app)
      .put('/auth/edit/1')
      .set('Authorization', 'Bearer valid-token') // Add authentication token
      .send(updatedData);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Użytkownik zaktualizowany');
    expect(response.body.user).toMatchObject({
      id: 1,
      name: 'Updated',
      surname: 'User',
      email: 'updated@example.com'
    });
    expect(mockDb.write).toHaveBeenCalled();
  });

  it('should return 401 if not authenticated', async () => {
    const updatedData = {
      name: 'Updated',
      surname: 'User',
      email: 'updated@example.com',
      password: 'newpassword'
    };

    const response = await request(app)
      .put('/auth/edit/1')
      .send(updatedData);

    expect(response.status).toBe(401);
  });

  it('should return 404 if the user does not exist', async () => {
    const updatedData = {
      name: 'Updated',
      surname: 'User',
      email: 'updated@example.com',
      password: 'newpassword'
    };

    const response = await request(app)
      .put('/auth/edit/999')
      .set('Authorization', 'Bearer valid-token') // Add authentication token
      .send(updatedData);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Nie odnaleziono użytkownika');
    expect(mockDb.write).not.toHaveBeenCalled();
  });
});


describe('DELETE /delete/:id', () => {
  it('should delete user successfully when authenticated', async () => {
    const response = await request(app)
      .delete('/auth/delete/1')
      .set('Authorization', 'Bearer valid-token'); // Add authentication token

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Użytkownik usunięty');
    expect(response.body.user).toMatchObject({
      id: 1,
      name: 'Test',
      surname: 'User',
      email: 'test@example.com'
    });
    expect(mockDb.data.users).toHaveLength(0);
    expect(mockDb.write).toHaveBeenCalled();
  });

  it('should return 401 if not authenticated', async () => {
    const response = await request(app)
      .delete('/auth/delete/1');

    expect(response.status).toBe(401);
  });

  it('should return 404 if the user does not exist', async () => {
    const response = await request(app)
      .delete('/auth/delete/999')
      .set('Authorization', 'Bearer valid-token'); // Add authentication token

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Nie odnaleziono użytkownika');
    expect(mockDb.data.users).toHaveLength(1);
    expect(mockDb.write).not.toHaveBeenCalled();
  });
});

  describe('GER /user/:id', () => {
    it('shoudl return users by ID succesfully', async() => {

      const response = await request(app).get('/auth/user/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        name: 'Test',
        surname: 'User',
        email: 'test@example.com'
      });
    });
    it('should return 404 if user does not exits', async() => {

      const response = await request(app).get('/auth/user/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Nie znaleziono użytkownika');
    })
  });
});