import express from 'express';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import authRoutes from './routes/auth.js';
import flashcardRoutes from './routes/flashcard.js';

// Create and configure Express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup function
export async function setupDatabase() {
  const adapter = new JSONFile('db.json');
  const db = new Low(adapter, { users: [], flashcards: [] });
  await db.read();
  return db;
}

// Initialize database and routes
export async function iapp() {
  const db = await setupDatabase();
  
  // Endpoint testowy
  app.get('/', (req, res) => {
    res.send('API działa!');
  });
  
  // Routing
  app.use('/api/auth', (req, res, next) => {
    req.db = db;
    next();
  }, authRoutes);
  
  // endpoint
  app.use('/flashcards', (req, res, next) => {
    req.db = db;
    next();
  }, flashcardRoutes);
  
  // Obsługa błędów JSON
  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      return res.status(400).json({ message: 'Invalid JSON format' });
    }
    next();
  });
  
  return app;
}

// Start server only if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = await iapp();
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}
  
export default iapp;