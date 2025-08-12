import crypto from "crypto"; 

export const addFlashcard = async (req, res) => {
  const db = req.db;
  await db.read();

  const { question, answer, category, sourceLang, targetLang } = req.body;

  if (!question || !answer || !category) {
    return res.status(400).json({ message: 'Wszystkie pola są wymagane.' });
  }

  const newFlashcard = {
    id: crypto.randomUUID(), // More reliable than Date.now().toString()
    question,
    answer,
    category,
    sourceLang,
    targetLang,
    box: 1,
    userId: req.user.userId, // Add user ID from auth middleware
  };
  
  console.log("req.user:", req.user);

  db.data.flashcards.push(newFlashcard);
  await db.write();
  res.status(201).json(newFlashcard);
  console.log("Użytkownik:", req.user);
};

export const updateFlashcardBox = async (req, res) => {
  const db = req.db;
  await db.read();

  const { id } = req.params;
  const { box } = req.body;

  if (typeof box !== 'number' || box < 1 || box > 5) {
    return res.status(400).json({ message: "Nieprawidłowy poziom boxa. Musi być liczbą od 1 do 5." });
  }

  const index = db.data.flashcards.findIndex(f => f.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Fiszka nie została znaleziona." });
  }

  // Sprawdzenie właściciela fiszki
  if (db.data.flashcards[index].userId && db.data.flashcards[index].userId !== req.user.userId) {
    return res.status(403).json({ message: "Brak uprawnień do edycji tej fiszki." });
  }

  db.data.flashcards[index].box = box;
  await db.write();

  res.status(200).json({ message: `Zaktualizowano poziom boxa na ${box}.`, flashcard: db.data.flashcards[index] });
};

export const editFlashcard = async (req, res) => {
  const db = req.db;
  await db.read();

  const { id } = req.params;
  const { question, answer, category, sourceLang, targetLang } = req.body;

  const index = db.data.flashcards.findIndex(f => f.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Fiszka nie została znaleziona." });
  }

  // Check if the flashcard belongs to the user
  if (db.data.flashcards[index].userId && db.data.flashcards[index].userId !== req.user.userId) {
    return res.status(403).json({ message: "Brak uprawnień do edycji tej fiszki." });
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
  res.status(200).json(db.data.flashcards[index]);
};



export const deleteFlashcard = async (req, res) => {
  const db = req.db;
  await db.read();

  const { id } = req.params;

  const index = db.data.flashcards.findIndex(f => f.id === id);
  if(index === -1){
    return res.status(404).json({message: "Fiszka nie została znaleziona."});
  }

  // Check if the flashcard belongs to the user
  if (db.data.flashcards[index].userId && db.data.flashcards[index].userId !== req.user.id) {
    return res.status(403).json({ message: "Brak uprawnień do usunięcia tej fiszki." });
  }

  const deleted = db.data.flashcards.splice(index, 1)[0];
  await db.write();
  res.status(200).json({ message: "Fiszka usunięta." });
};

export const getFlashcardById = async (req, res) => {
  const db = req.db;
  await db.read();

  const { id } = req.params;
  const flashcard = db.data.flashcards.find(f => f.id === id);
  
  if (!flashcard) {
    return res.status(404).json({ message: "Fiszka nie została znaleziona." });
  }
  
  // Check if the flashcard belongs to the user
  if (flashcard.userId && flashcard.userId !== req.user.userId)  {
    return res.status(403).json({ message: "Brak uprawnień do wyświetlenia tej fiszki." });
  }
  
  res.status(200).json(flashcard);
};


export const getFlashcards = async (req, res) => {
  const db = req.db;
  await db.read();

  // Get the user ID from the authenticated request
  const userId = req.user?.userId;

  // Filter flashcards to only show those belonging to the current user
  const flashcards = db.data.flashcards.filter(f => f.userId === userId) || [];
  
  res.status(200).json({ flashcards });
}

export const deleteCategory = async (req,res) => {
  const db = req.db;
  await db.read();

  const { category } = req.params;
  const userId = req.user.userId;

  const initialLength = db.data.flashcards.length;
  
  // Only delete flashcards that belong to the user
  db.data.flashcards = db.data.flashcards.filter(f => 
    f.category !== category || (f.userId && f.userId !== userId)
  );

  const deletedCount = initialLength - db.data.flashcards.length;

  if(deletedCount === 0){
    return res.status(404).json({ message: "Nie znaleziono fiszek w tej kategorii" });
  }
  
  await db.write();
  res.status(200).json({ message: `Usunięto ${deletedCount} fiszek z kategorii '${category}'.` });
};

export const getCategories = async (req, res) => {
  const db = req.db;
  await db.read();

  const userId = req.user.userId;
  
  // Only get categories for the user's flashcards
  const userFlashcards = db.data.flashcards.filter(f => !f.userId || f.userId === userId);
  const categories = [...new Set(userFlashcards.map(f => f.category))];

  res.status(200).json(categories);
};


export const addBulkFlashcards = async (req, res) => {
  const db = req.db;
  await db.read();

  const newCards = req.body;

  if(!Array.isArray(newCards)){
    return res.status(400).json({ message: "Oczekiwano tablicy fiszek." });
  }

  const withIds = newCards.map(card => ({
    ...card,
    id: crypto.randomUUID(),
    userId: req.user.userId // Add user ID from auth middleware
  }));
  
  db.data.flashcards.push(...withIds);
  await db.write();

  res.status(201).json({ message: `Dodano ${withIds.length} fiszek.`, flashcards: withIds });
};

export const getFlashcardStats = async(req, res) => {
  const db = req.db;
  await db.read();

  const userId = req.user.userId;
  const userFlashcards = db.data.flashcards.filter(f => f.userId === userId);

  const stats = {};

  userFlashcards.forEach(card => {
    const category = card.category;
    if(!stats[category]){
      stats[category] = {
        count: 0,
        totalBox: 0,
        sourceLangs: new Set(),
        targetLangs: new Set()
      };
    }
    stats[category].count += 1;
    stats[category].totalBox += card.box;
    stats[category].sourceLangs.add(card.sourceLang);
    stats[category].targetLangs.add(card.targetLang);
  });

  const formattedStats = Object.entries(stats).map(([category, data]) =>({
    category,
    numberOfFlashcards: data.count,
    averageBoxLevel: parseFloat((data.totalBox / data.count).toFixed(2)),
    sourceLanguages: Array.from(data.sourceLangs),
    targetLanguages: Array.from(data.targetLangs)
  }))

  res.status(200).json({stats: formattedStats})
}