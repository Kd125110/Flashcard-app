import express from 'express';

const router = express.Router();

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
