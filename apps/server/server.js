import express from 'express';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import authRoutes from './routes/auth.js';
import flashcardRoutes from './routes/flashcard.js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';


// Load environment variables
dotenv.config();

// Ensure JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  console.log('JWT_SECRET not found in environment variables, using default secret');
  process.env.JWT_SECRET = '3f9a8b7c2e1d4f6a9b0c7e5d1a2f3c4b6e7d8a9c0b1e2f3d4c5a6b7e8f9a0b1';
}

// Get the directory name properly in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'], // Frontend URLs
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Initialize database
const initializeDb = async () => {
  // Use absolute path to ensure the database file is found correctly
  const dbPath = path.join(__dirname, 'db.json');
  console.log(`Initializing database at: ${dbPath}`);
  
  const adapter = new JSONFile(dbPath);
  const db = new Low(adapter, { users: [], flashcards: [] });
  
  try {
    await db.read();
    console.log(`Database loaded successfully. Users: ${db.data.users.length}, Flashcards: ${db.data.flashcards.length}`);
    return db;
  } catch (error) {
    console.error(`Error loading database: ${error.message}`);
    throw error;
  }
};

// Global database instance
let dbInstance = null;

// Debug middleware to log requests
const requestLogger = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
};

// Setup routes
const setupRoutes = (app, db) => {
  // Add request logging in development
  if (process.env.NODE_ENV !== 'production') {
    app.use(requestLogger);
  }

  // Test endpoint
  app.get('/', (req, res) => {
    res.send('API działa!');
  });

  // Debug endpoint to check database state
  app.get('/api/debug/db', (req, res) => {
    res.json({
      usersCount: db.data.users.length,
      flashcardsCount: db.data.flashcards.length
    });
  });

  // Debug endpoint to check JWT
  app.get('/api/debug/jwt', (req, res) => {
    res.json({
      jwtSecretSet: !!process.env.JWT_SECRET,
      jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0
    });
  });

  // Auth routes
  app.use('/api/auth', (req, res, next) => {
    req.db = db;
    next();
  }, authRoutes);

  // Flashcard routes
  app.use('/flashcards', (req, res, next) => {
    req.db = db;
    next();
  }, flashcardRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
  });

  // Error handling for JSON
  app.use((err, req, res, next) => {
    console.error(`Error processing request: ${err.message}`);
    
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      return res.status(400).json({ message: 'Invalid JSON format' });
    }
    
    res.status(500).json({ message: 'Internal server error', error: err.message });
  });
};

// Initialize the server
const initializeServer = async () => {
  try {
    // Only initialize the database once
    if (!dbInstance) {
      dbInstance = await initializeDb();
    }
    
    setupRoutes(app, dbInstance);
    return app;
  } catch (error) {
    console.error(`Server initialization failed: ${error.message}`);
    throw error;
  }
};

// Start the server if this file is run directly
const isRunDirectly = import.meta.url.startsWith('file:') && 
  (process.argv[1] === fileURLToPath(import.meta.url) || process.argv[1].endsWith('server.js'));

if (isRunDirectly) {
  initializeServer().then(() => {
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
      console.log(`JWT_SECRET is ${process.env.JWT_SECRET ? 'configured' : 'NOT configured'}`);
    });
  }).catch(err => {
    console.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  });
}

// Export for testing
export { app, initializeServer };
