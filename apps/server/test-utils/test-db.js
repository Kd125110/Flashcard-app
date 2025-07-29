import { join } from 'path';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function setupTestDatabase() {
  const testDbPath = join(__dirname, 'test-db.json');
  const adapter = new JSONFile(testDbPath);
  const db = new Low(adapter, { 
    users: [
      { 
        id: 'test-user-id', 
        username: 'testuser', 
        password: 'hashedpassword123' 
      }
    ], 
    flashcards: [
      {
        id: 'test-card-1',
        userId: 'test-user-id',
        question: 'Test Question',
        answer: 'Test Answer',
        category: 'Test'
      }
    ] 
  });
  
  await db.read();
  await db.write(); // Ensure the test data is written
  return db;
}