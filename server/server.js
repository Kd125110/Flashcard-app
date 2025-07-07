import express from 'express';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import authRoutes from './routes/auth.js';

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Baza danych
const adapter = new JSONFile('db.json');
const db = new Low(adapter, { users: [], flashcards: [] });
await db.read();

// Endpoint testowy
app.get('/', (req, res) => {
  res.send('API działa!');
});


// Routing
app.use('/api/auth', (req, res, next) => {
  req.db = db;
  next();
}, authRoutes);

// Testowy endpoint
app.get('/flashcards', (req, res) => {
  res.json(db.data.flashcards);
});

// Obsługa błędów JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON format' });
  }
  next();
});

// Start serwera
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
