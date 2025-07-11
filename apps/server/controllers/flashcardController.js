import e from "express";

export const addFlashcard = async (req, res) => {
  const db = req.db;
  await db.read();

  const { question, answer, category, sourceLang, targetLang } = req.body;

  if (!question || !answer || !category) {
    return res.status(400).json({ message: 'Wszystkie pola są wymagane.' });
  }

  const newFlashcard = {
    id: Date.now().toString(),
    question,
    answer,
    category,
    sourceLang,
    targetLang,
  };

  db.data.flashcards.push(newFlashcard);
  await db.write();
  res.status(201).json({ message: 'Dodano fiszkę!', flashcard: newFlashcard });
};



  export const getFlashcard = async (req, res) => {
    const db = req.db;
    await db.read();

    const flashcards = db.data.flashcards || [];
    res.status(200).json({flashcards});
  }
