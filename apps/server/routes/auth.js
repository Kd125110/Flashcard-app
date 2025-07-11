import express from 'express';

const router = express.Router();

router.post('/register', async (req, res) => {
  const db = req.db;
  await db.read();

  const { email, password } = req.body;

  const existingUser = db.data.users.find((u) => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const newUser = {
    id: db.data.users.length + 1,
    email,
    password,
  };
  
  db.data.users.push(newUser);
  await db.write();
  
  res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
}),

router.post('/login', async (req, res) => {
  const db = req.db;
  await db.read();

  const { email, password } = req.body;

  const user = db.data.users.find(
    (u) => u.email === email && u.password === password
  );

  if (user) {
    res.status(200).json({ message: 'Login successful', userId: user.id });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

export default router;
