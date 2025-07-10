import express from 'express';
import { addFlashcard, getFlashcard } from '../controllers/flashcardController.js';

const router = express.Router();

router.post('/add', addFlashcard);

router.get('/', getFlashcard)
export default router;