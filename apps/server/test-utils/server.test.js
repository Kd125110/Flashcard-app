import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import iapp from '../server.js';

let app;
let server;

beforeAll(async () => {
  // Initialize the app
  app = await iapp();
  
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
    // Simply check if the server is defined and has an address
    expect(server).toBeDefined();
    expect(server.address()).not.toBeNull();
    expect(server.address().port).toBeGreaterThan(0);
  });
});