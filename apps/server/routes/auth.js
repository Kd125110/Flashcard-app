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

// 📝 Register route
router.post('/register', async (req, res) => {
  const db = req.db;
  await db.read();

  const { email, password } = req.body;

  const existingUser = db.data.users.find((u) => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: db.data.users.length + 1,
    email,
    password: hashedPassword,
  };

  db.data.users.push(newUser);
  await db.write();

  const token = jwt.sign(
    { userId: newUser.id, email: newUser.email },
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

export default router;
