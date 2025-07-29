import express from 'express';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import authRoutes from './routes/auth.js';
import flashcardRoutes from './routes/flashcard.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name properly in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
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
    console.log(`Database loaded successfully. Users: ${db.data.users.length}`);
    return db;
  } catch (error) {
    console.error(`Error loading database: ${error.message}`);
    throw error;
  }
};

// Global database instance
let dbInstance = null;

// Setup routes
const setupRoutes = (app, db) => {
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

  // Error handling for JSON
  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      return res.status(400).json({ message: 'Invalid JSON format' });
    }
    next();
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
    });
  }).catch(err => {
    console.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  });
}

// Export for testing
export { app, initializeServer };
