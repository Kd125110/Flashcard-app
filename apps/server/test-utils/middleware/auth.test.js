import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

// Import the middleware after mocking dependencies
import { authenticateToken } from '../../middleware/auth.js';

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      sendStatus: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();

    // Reset JWT mock
    jwt.verify.mockReset();
  });

  it('should return 401 if no authorization header is provided', () => {
    authenticateToken(req, res, next);
    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if authorization header has no token', () => {
    req.headers.authorization = 'Bearer ';
    authenticateToken(req, res, next);
    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if token verification fails', () => {
    req.headers.authorization = 'Bearer invalid-token';
    
    jwt.verify.mockImplementationOnce((token, secret, callback) => {
      callback(new Error('Invalid token'), null);
    });

    authenticateToken(req, res, next);
    expect(res.sendStatus).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() and set req.user if token is valid', () => {
    req.headers.authorization = 'Bearer valid-token';
    const mockUser = { userId: 1, email: 'test@example.com' };
    
    jwt.verify.mockImplementationOnce((token, secret, callback) => {
      callback(null, mockUser);
    });

    authenticateToken(req, res, next);
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
    expect(res.sendStatus).not.toHaveBeenCalled();
  });

  it('should handle unexpected errors during token verification', () => {
    req.headers.authorization = 'Bearer valid-token';
    
    jwt.verify.mockImplementationOnce(() => {
      throw new Error('Unexpected error');
    });

    authenticateToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.any(String)
    }));
    expect(next).not.toHaveBeenCalled();
  });
});