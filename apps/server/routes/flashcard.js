import express from 'express';
import { authenticateToken } from '../middleware/auth.js'; // Update the path as needed
import * as flashcardController from '../controllers/flashcardController.js';

const router = express.Router();

router.use(authenticateToken);


// Define routes
router.post('/add', flashcardController.addFlashcard);
router.get('/categories', flashcardController.getCategories); // Move this before /:id
router.get('/', flashcardController.getFlashcards);
router.get('/:id', flashcardController.getFlashcardById);
router.put('/:id', flashcardController.editFlashcard);
router.delete('/:id', flashcardController.deleteFlashcard);
router.delete('/category/:category', flashcardController.deleteCategory);
router.post('/bulk', flashcardController.addBulkFlashcards);

export default router;