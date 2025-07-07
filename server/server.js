import express from 'express';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const adapter = new JSONFile('db.json');
const db = new Low(adapter, { flashcards: [] });
await db.read();

app.get('/flashcards', (req, res) => {
  res.json(db.data.flashcards);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});