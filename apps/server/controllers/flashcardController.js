import crypto from "crypto"; 

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

export const editFlashcard = async (req, res) => {
  console.log("EDYCJA:", req.params.id); // 👈 sprawdź, czy w ogóle wchodzi

  const db = req.db;
  await db.read();

  const { id } = req.params;
  const { question, answer, category, sourceLang, targetLang } = req.body;

  const index = db.data.flashcards.findIndex(f => f.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Fiszka nie została znaleziona." });
  }

  db.data.flashcards[index] = {
    ...db.data.flashcards[index],
    question,
    answer,
    category,
    sourceLang,
    targetLang
  };

  await db.write();
  res.status(200).json({ message: "Fiszka zaktualizowana.", flashcard: db.data.flashcards[index] });
};



export const deleteFlashcard = async (req, res) => {
    const db = req.db;
    await db.read();

    const { id } = req.params;

    const index = db.data.flashcards.findIndex(f => f.id === id);
    if(index === -1){
      return res.status(404).json({message: "Fiszka nie została znelziona."});
    }

    const deleted = db.data.flashcards.splice(index, 1)[0];
    await db.write();
    res.status(200).json({message: "Fiszka usunieta.", flashcard: deleted})

}

  export const getFlashcard = async (req, res) => {
    const db = req.db;
    await db.read();

    const flashcards = db.data.flashcards || [];
    res.status(200).json({flashcards});
  }

export const deleteCategory = async (req,res) => {
  const db = req.db;
  await db.read();

  const { category } = req.params;

  const initialLength = db.data.flashcards.length;

  db.data.flashcards = db.data.flashcards.filter(f => f.category !== category);

  const deletedCount = initialLength - db.data.flashcards.length;

  if(deletedCount === 0){
    return res.status(404).json({ message: "Nie znaleziono fiszek w tej kategori"});
  }
  await db.write();

  res.status(200).json({ message: `Usunieto ${deletedCount} fiszek z kategori '${category}'.`})

};

export const getCategories = async (req, res) => {
  const db = req.db;
  await db.read();

  const flashcards = db.data.flashcards;

  const categories = [...new Set(flashcards.map(f => f.category))];

  res.status(200).json({categories})
}

export const addBulkFlashcards = async (req, res) => {
  const db = req.db;
  await db.read();

  const newCards = req.body;

  if(!Array.isArray(newCards)){
    return res.status(400).json({ message: "Oczekiwano tablicy fiszek. "});
  }

  const withIds = newCards.map(card => ({
    ...card,
    id: crypto.randomUUID()
  }))
  db.data.flashcards.push(...withIds);
  await db.write()

  res.status(201).json({ message: `Dodano ${withIds.length} fiszek.`});
}
