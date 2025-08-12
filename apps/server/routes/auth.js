import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { authenticateToken } from '../middleware/auth.js';

dotenv.config();


const router = express.Router();

// 🔐 Protected route example
router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

router.get('/test', (req, res) => {
  res.json({ message: "Auth router is working" });
});

// 📝 Register route
router.post('/register', async (req, res) => {
  const db = req.db;
  await db.read();

  const { name,surname,email, password } = req.body;

  const existingUser = db.data.users.find((u) => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: db.data.users.length + 1,
    name,
    surname,
    email,
    password: hashedPassword,
    correctAnswers: 0,
    wrongAnswers: 0
  };

  db.data.users.push(newUser);
  await db.write();

  const token = jwt.sign(
    { userId: newUser.id, name:newUser.name, surname:newUser.surname, email: newUser.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.status(201).json({
    message: 'User registered successfully',
    userId: newUser.id,
    token,
  });
});

// 🔑 Login route
router.post('/login', async (req, res) => {
  const db = req.db;
  await db.read();

  const { email, password } = req.body;

  const user = db.data.users.find((u) => u.email === email);
  if (!user) {
    return res.status(401).json({ message: 'Błędne dane' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Błędne dane' });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.status(200).json({ message: 'Zalogowano', token });
});


router.put('/edit/:id',authenticateToken, async (req, res) => {
  const db = req.db;
  await db.read();

  const { id } = req.params;
  const { name, surname, email, password } = req.body;

  const index = db.data.users.findIndex(user => user.id === Number(id));

  if (index === -1) {
    return res.status(404).json({ message: "Nie odnaleziono użytkownika" });
  }

  // Hash the password if it's provided
  let updatedUser = { ...db.data.users[index], name, surname, email };
  
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    updatedUser.password = hashedPassword;
  }

  db.data.users[index] = updatedUser;
  await db.write();
  
  // Don't return the password in the response
  const { password: _, ...userWithoutPassword } = db.data.users[index];
  
  res.status(200).json({ 
    message: "Użytkownik zaktualizowany", 
    user: userWithoutPassword
  });
});

router.delete('/delete/:id',authenticateToken, async (req, res) => {
  const db = req.db;
  await db.read();

  const {id} = req.params;

  const index = db.data.users.findIndex(user => user.id === Number(id));

  if(index === -1){
    return res.status(404).json({message:"Nie odnaleziono użytkownika"})
  }

  const deleted = db.data.users.splice(index, 1)[0];
  await db.write();

  res.status(200).json({message: "Użytkownik usunięty", user: deleted})

})

router.get('/user/:id', async (req, res) => {
  const db = req.db;
  await db.read();

  const { id } = req.params;
  const user = db.data.users.find(u => u.id === Number(id));

  if (!user) {
    return res.status(404).json({ message: "Nie znaleziono użytkownika" });
  }

  res.status(200).json({
    id: user.id,
    name: user.name,
    surname: user.surname,
    email: user.email,
  });
});

router.post('/answers', authenticateToken, async (req, res) => {
  try {
    const db = req.db;
    await db.read();

    const userId = req.user.userId;
    const { isCorrect } = req.body;

    const user = db.data.users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ message: "Nie znaleziono użytkownika" });
    }

  


    if (isCorrect) {
      user.correctAnswers = (user.correctAnswers || 0) + 1;
    } else {
      user.wrongAnswers = (user.wrongAnswers || 0) + 1;
    }

    await db.write();

    res.status(200).json({
      message: "Odpowiedź zapisana",
      correctAnswers: user.correctAnswers,
      wrongAnswers: user.wrongAnswers
    });
  } catch (error) {
    res.status(500).json({ message: "Błąd serwera", error: error.message });
  }
});


// 📊 Get user stats
router.get('/user-stats/:id', authenticateToken, async (req, res) => {
  const db = req.db;
  await db.read();

  const { id } = req.params;
  const user = db.data.users.find(u => u.id === Number(id));

  if (!user) {
    return res.status(404).json({ message: "Nie znaleziono użytkownika" });
  }

  const correct = user.correctAnswers || 0;
  const wrong = user.wrongAnswers || 0;
  const total = correct + wrong;
  const percentage = total > 0 ? ((correct / total) * 100).toFixed(2) : "0.00";

  res.status(200).json({
    correctAnswers: correct,
    wrongAnswers: wrong,
    percentageCorrect: `${percentage}%`
  });
});






export default router;
