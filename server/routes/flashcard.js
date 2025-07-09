import express from 'express';
import { addFlashcard } from '../controllers/flashcardController.js';

const router = express.Router();

router.post('/add', addFlashcard);

export default router;