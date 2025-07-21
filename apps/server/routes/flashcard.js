import express from 'express';
import { addFlashcard, getFlashcard, editFlashcard, deleteFlashcard,deleteCategory } from '../controllers/flashcardController.js';

const router = express.Router();

router.post('/add', addFlashcard);
router.put('/edit/:id',editFlashcard);
router.get('/', getFlashcard)
router.delete('/delete/:id', deleteFlashcard)
router.delete('/delete/category/:category', deleteCategory);

export default router;