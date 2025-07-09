export const addFlashcard = async (req, res) => {
  const db = req.db;
  await db.read();

  const { question, answer, category } = req.body;

  if (!question || !answer || !category) {
    return res.status(400).json({ message: 'Wszystkie pola są wymagane.' });
  }

  const newFlashcard = {
    id: Date.now().toString(),
    question,
    answer,
    category,
  };

  db.data.flashcards.push(newFlashcard);
  await db.write();

  res.status(201).json({ message: 'Dodano fiszkę!', flashcard: newFlashcard });
};
