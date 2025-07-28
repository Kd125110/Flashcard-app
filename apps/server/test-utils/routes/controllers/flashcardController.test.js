import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";
import express from 'express';
import request from "supertest";
import * as flashcardController from '../../../controllers/flashcardController.js';

jest.mock('crypto', () => ({
    randomUUID: jest.fn().mockReturnValue('mock-uuid-123')
}));

describe('Flashcard Controller', () => {
    let app;
    let mockDb;

    beforeEach(() => {
        // Setup Express app for testing
        app = express();
        app.use(express.json());

        // Mock database - Changed 'flashcard' to 'flashcards' to match controller expectations
        mockDb = {
            data: {
                flashcards: [
                    {
                        id: 'existing-id-1',
                        question: 'What is Jest',
                        answer: 'A javascript testing framework',
                        category: 'Programming',
                        sourceLang: 'en',
                        targetLang: 'en',
                    },
                    {
                        id: 'existing-id-2',
                        question: 'What is React?',
                        answer: 'A JavaScript library for building user interfaces',
                        category: 'Programming',
                        sourceLang: 'en',
                        targetLang: 'en'
                    },
                    {
                        id: 'existing-id-3',
                        question: 'Hej',
                        answer: 'Hello',
                        category: 'Polish',
                        sourceLang: 'pl',
                        targetLang: 'en'
                    }
                ]
            },

            read: jest.fn().mockResolvedValue(),
            write: jest.fn().mockResolvedValue()
        };

        // Add mockDb to request object
        app.use((req, res, next) => {
            req.db = mockDb;
            next();
        });

        app.post('/flashcards', flashcardController.addFlashcard);
        app.put('/flashcards/:id', flashcardController.editFlashcard);
        app.delete('/flashcards/:id', flashcardController.deleteFlashcard);
        app.get('/flashcards', flashcardController.getFlashcard);
        app.delete('/categories/:category', flashcardController.deleteCategory);
        app.get('/categories', flashcardController.getCategories);
        app.post('/flashcards/bulk', flashcardController.addBulkFlashcards);
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('addFlashcard', () => {
        it('should add a new flashcard successfully', async () => {
            const newFlashcard = {
                question: 'New Question',
                answer: 'New Answer',
                category: 'New Category',
                sourceLang: 'en',
                targetLang: 'pl'
            };

            const originalDateNow = Date.now;
            Date.now = jest.fn(() => 1234567890);

            const response = await request(app)
                .post('/flashcards')
                .send(newFlashcard);

            Date.now = originalDateNow;

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('message', 'Dodano fiszkę!');
            expect(response.body.flashcard).toEqual({
                id: '1234567890',
                ...newFlashcard
            });
            expect(mockDb.data.flashcards).toHaveLength(4); // Changed from flashcard to flashcards
            expect(mockDb.write).toHaveBeenCalled();
        });
    });

    // Add more test blocks for other functions
});