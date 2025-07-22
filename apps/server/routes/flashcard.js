import express from 'express';
import { addFlashcard, getFlashcard, editFlashcard, deleteFlashcard,deleteCategory,addBulkFlashcards, getCategories } from '../controllers/flashcardController.js';

const router = express.Router();

router.post('/add', addFlashcard);
router.put('/edit/:id',editFlashcard);
router.get('/', getFlashcard);
router.delete('/delete/:id', deleteFlashcard);
router.delete('/delete/category/:category', deleteCategory);
router.post('/add-bulk', addBulkFlashcards);
router.get('/categories', getCategories);


export default router;