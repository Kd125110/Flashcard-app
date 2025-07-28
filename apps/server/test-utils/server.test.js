import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { initializeServer } from '../server.js';
import request from 'supertest';

let app;
let server;

beforeAll(async () => {
  // Initialize the app
  app = await initializeServer();
  
  // Start the server on a random port
  return new Promise((resolve) => {
    server = app.listen(0, () => {
      console.log(`Test server started on port ${server.address().port}`);
      resolve();
    });
  });
});

afterAll(async () => {
  // Clean up by closing the server
  return new Promise((resolve) => {
    if (server) {
      server.close(() => {
        console.log('Test server closed');
        resolve();
      });
    } else {
      resolve();
    }
  });
});

describe('Server', () => {
  it('should start successfully', () => {
    expect(server).toBeDefined();
    expect(server.address()).not.toBeNull();
    expect(server.address().port).toBeGreaterThan(0);
  });
  
  it('should respond to the root endpoint', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('API działa!');
  });
  
  it('should have database initialized', async () => {
    const response = await request(app).get('/api/debug/db');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('usersCount');
    expect(response.body).toHaveProperty('flashcardsCount');
  });
});