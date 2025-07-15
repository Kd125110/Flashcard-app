import express from 'express';
import { addFlashcard, getFlashcard, editFlashcard, deleteFlashcard } from '../controllers/flashcardController.js';

const router = express.Router();

router.post('/add', addFlashcard);
router.put('/edit/:id',editFlashcard);
router.get('/', getFlashcard)
router.delete('/delete/:id', deleteFlashcard)
export default router;