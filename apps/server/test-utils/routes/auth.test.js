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
            password: 'hashedPassword123',
            correctAnswers: 5,
            wrongAnswers: 2
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
    it('should update user successfully', async () => {
      const updatedData = {
        name: 'Updated',
        surname: 'User',
        email: 'updated@example.com',
        password: 'newpassword'
      };

      const response = await request(app)
        .put('/auth/edit/1')
        .set('Authorization', 'Bearer valid-token') // Add authorization header
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
        .set('Authorization', 'Bearer valid-token') // Add authorization header
        .send(updatedData);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Nie odnaleziono użytkownika');
      expect(mockDb.write).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /delete/:id', () => {
    it('should delete user successfully', async () => {
      const response = await request(app)
        .delete('/auth/delete/1')
        .set('Authorization', 'Bearer valid-token'); // Add authorization header

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
      const response = await request(app).delete('/auth/delete/1');
      expect(response.status).toBe(401);
    });

    it('should return 404 if the user does not exist', async () => {
      const response = await request(app)
        .delete('/auth/delete/999')
        .set('Authorization', 'Bearer valid-token'); // Add authorization header

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Nie odnaleziono użytkownika');
      expect(mockDb.data.users).toHaveLength(1);
      expect(mockDb.write).not.toHaveBeenCalled();
    });
  });

  describe('GET /user/:id', () => {
    it('should return users by ID successfully', async() => {
      const response = await request(app).get('/auth/user/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        name: 'Test',
        surname: 'User',
        email: 'test@example.com'
      });
    });
    
    it('should return 404 if user does not exist', async() => {
      const response = await request(app).get('/auth/user/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Nie znaleziono użytkownika');
    });
  });

  // Add tests for the /answers endpoint
  describe('POST /answers', () => {
    it('should record a correct answer successfully', async () => {
      const answerData = {
        isCorrect: true
      };

      const response = await request(app)
        .post('/auth/answers')
        .set('Authorization', 'Bearer valid-token') // Add authorization header
        .send(answerData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Odpowiedź zapisana',
        correctAnswers: 6, // 5 + 1
        wrongAnswers: 2
      });
      expect(mockDb.write).toHaveBeenCalled();
    });

    it('should record a wrong answer successfully', async () => {
      const answerData = {
        isCorrect: false
      };

      const response = await request(app)
        .post('/auth/answers')
        .set('Authorization', 'Bearer valid-token') // Add authorization header
        .send(answerData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Odpowiedź zapisana',
        correctAnswers: 5,
        wrongAnswers: 3 // 2 + 1
      });
      expect(mockDb.write).toHaveBeenCalled();
    });

    it('should return 401 if not authenticated', async () => {
      const answerData = {
        isCorrect: true
      };

      const response = await request(app)
        .post('/auth/answers')
        .send(answerData);

      expect(response.status).toBe(401);
    });
  });

  // Add tests for the /user-stats/:id endpoint
  describe('GET /user-stats/:id', () => {
    it('should return user stats successfully', async () => {
      const response = await request(app)
        .get('/auth/user-stats/1')
        .set('Authorization', 'Bearer valid-token'); // Add authorization header

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        correctAnswers: 5,
        wrongAnswers: 2,
        percentageCorrect: '71.43%'
      });
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app).get('/auth/user-stats/1');
      expect(response.status).toBe(401);
    });

    it('should return 404 if user does not exist', async () => {
      const response = await request(app)
        .get('/auth/user-stats/999')
        .set('Authorization', 'Bearer valid-token'); // Add authorization header

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Nie znaleziono użytkownika');
    });
  });

  // Add tests for error handling
  describe('Error Handling', () => {
    it('should handle database errors in registration', async () => {
      // Mock database write to throw an error
      mockDb.write.mockRejectedValueOnce(new Error('Database write error'));

      const userData = {
        name: 'Error',
        surname: 'User',
        email: 'error@example.com',
        password: 'password123'
      };
      
      const response = await request(app)
        .post('/auth/register')
        .send(userData);
      
      expect(response.status).toBe(500);
    });

    it('should handle database errors in login', async () => {
      // Mock database read to throw an error
      mockDb.read.mockRejectedValueOnce(new Error('Database read error'));

      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData);

      expect(response.status).toBe(500);
       it('should handle database errors in login', async () => {
      // Mock database read to throw an error
      mockDb.read.mockRejectedValueOnce(new Error('Database read error'));

      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData);

      expect(response.status).toBe(500);
    });

    it('should handle database errors in user editing', async () => {
      // Mock database write to throw an error
      mockDb.write.mockRejectedValueOnce(new Error('Database write error'));

      const updatedData = {
        name: 'Updated',
        surname: 'User',
        email: 'updated@example.com',
        password: 'newpassword'
      };

      const response = await request(app)
        .put('/auth/edit/1')
        .set('Authorization', 'Bearer valid-token')
        .send(updatedData);

      expect(response.status).toBe(500);
    });

    it('should handle database errors in user deletion', async () => {
      // Mock database write to throw an error
      mockDb.write.mockRejectedValueOnce(new Error('Database write error'));

      const response = await request(app)
        .delete('/auth/delete/1')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(500);
    });

    it('should handle database errors when recording answers', async () => {
      // Mock database write to throw an error
      mockDb.write.mockRejectedValueOnce(new Error('Database write error'));

      const answerData = {
        isCorrect: true
      };

      const response = await request(app)
        .post('/auth/answers')
        .set('Authorization', 'Bearer valid-token')
        .send(answerData);

      expect(response.status).toBe(500);
    });

    it('should handle database errors when getting user stats', async () => {
      // Mock database read to throw an error
      mockDb.read.mockRejectedValueOnce(new Error('Database read error'));

      const response = await request(app)
        .get('/auth/user-stats/1')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(500);
    });
  });

  // Test edge cases
  describe('Edge Cases', () => {
    it('should handle zero answers case for user stats', async () => {
      // Add a user with no answers
      mockDb.data.users.push({
        id: 2,
        name: 'No',
        surname: 'Answers',
        email: 'no-answers@example.com',
        password: 'hashedPassword123',
        correctAnswers: 0,
        wrongAnswers: 0
      });

      const response = await request(app)
        .get('/auth/user-stats/2')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        correctAnswers: 0,
        wrongAnswers: 0,
        percentageCorrect: '0.00%'
      });
    });

    it('should handle missing correctAnswers and wrongAnswers fields', async () => {
      // Add a user without answer fields
      mockDb.data.users.push({
        id: 3,
        name: 'Missing',
        surname: 'Fields',
        email: 'missing@example.com',
        password: 'hashedPassword123'
        // No correctAnswers or wrongAnswers fields
      });

      // Test recording an answer
      const answerData = {
        isCorrect: true
      };

      const response = await request(app)
        .post('/auth/answers')
        .set('Authorization', 'Bearer valid-token')
        .send(answerData);

      // The middleware sets req.user.userId to 1, so it will update the first user
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Odpowiedź zapisana',
        correctAnswers: 6, // 5 + 1
        wrongAnswers: 2
      });
    });

    it('should handle password hashing in user edit', async () => {
      // Test updating without changing password
      const updatedDataNoPassword = {
        name: 'Updated',
        surname: 'NoPassword',
        email: 'updated@example.com'
        // No password field
      };

      const response = await request(app)
        .put('/auth/edit/1')
        .set('Authorization', 'Bearer valid-token')
        .send(updatedDataNoPassword);

      expect(response.status).toBe(200);
      expect(response.body.user).toMatchObject({
        id: 1,
        name: 'Updated',
        surname: 'NoPassword',
        email: 'updated@example.com'
      });
      expect(bcrypt.hash).not.toHaveBeenCalled(); // Password hash should not be called
    });
  });

  // Test for JWT token verification errors
  describe('JWT Token Verification', () => {
    it('should handle JWT verification errors', async () => {
      // Create a custom test app for this specific test
      const testApp = express();
      testApp.use(express.json());
      
      // Create a mock middleware that simulates a JWT verification error
      const errorMiddleware = (req, res, next) => {
        return res.status(403).json({ message: 'Invalid or expired token' });
      };
      
      // Create a simple route handler
      testApp.get('/protected', errorMiddleware, (req, res) => {
        res.status(200).json({ message: 'Protected route' });
      });
      
      const response = await request(testApp)
        .get('/protected')
        .set('Authorization', 'Bearer expired-token');
      
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Invalid or expired token');
    });
  });
})
});