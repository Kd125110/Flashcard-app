import { describe, it, expect, beforeEach, afterEach, jest, afterAll } from "@jest/globals";
import express from 'express';
import request from "supertest";
import crypto from 'crypto';

// Store the original function
const originalRandomUUID = crypto.randomUUID;

// Replace the function directly
crypto.randomUUID = jest.fn().mockReturnValue('mock-uuid-123');

// Now import the controller (after mocking)
import * as flashcardController from '../../controllers/flashcardController.js';

describe('Flashcard Controller', () => {
    let app;
    let mockDb;

    beforeEach(() => {
        // Ensure the mock is still in place
        crypto.randomUUID = jest.fn().mockReturnValue('mock-uuid-123');
        
        // Setup Express app for testing
        app = express();
        app.use(express.json());

        // Mock database
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

    // Restore the original function after all tests
    afterAll(() => {
        crypto.randomUUID = originalRandomUUID;
    });

    it('should mock crypto.randomUUID correctly', () => {
        expect(crypto.randomUUID()).toBe('mock-uuid-123');
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
            expect(mockDb.data.flashcards).toHaveLength(4);
            expect(mockDb.write).toHaveBeenCalled();
        });

        it('should return 400 if requred fields are missing', async () => {
            const incompleteFlashcard = {
                question: 'Incomplete question',
                //Missing
                sourceLang: 'en',
                targetLang: 'pl'
            }

            const response = await request(app)
                .post('/flashcards')
                .send(incompleteFlashcard);
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Wszystkie pola są wymagane.');
            expect(mockDb.data.flashcards).toHaveLength(3);
            expect(mockDb.write).not.toHaveBeenCalled();
        });
    });

    describe('editFlashcard', () => {
        it('should edit and existing flashcard successfully', async () => {
            const updatedFlashcard = {
                question: 'Updated Question',
                answer: 'Updated Answer',
                category: 'Updated Category',
                sourceLang: 'en',
                targetLang: 'en'
            }

            const response = await request(app)
                .put('/flashcards/existing-id-1')
                .send(updatedFlashcard)

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Fiszka zaktualizowana.');
            expect(response.body.flashcard).toEqual({
                id: 'existing-id-1',
                ...updatedFlashcard
            });
            expect(mockDb.data.flashcards[0]).toEqual({
                id: 'existing-id-1',
                ...updatedFlashcard
            })
            expect(mockDb.write).toHaveBeenCalled();
        });

        it('should return 404 if flashcard does not exist', async () => {
            const updatedFlashcard = {
                question: 'Updated Question',
                answer: 'Updated Answer',
                category: 'Updated Category',
                sourceLang: 'en',
                targetLang: 'en'
            }

            const response = await request(app)
                .put('/flashcards/non-existent-id')
                .send(updatedFlashcard);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Fiszka nie została znaleziona.')
            expect(mockDb.write).not.toHaveBeenCalled();
        });
    });

    describe('deleteFlashcard', () => {
        it('should delete and existing flashcard succesfully', async () => {
            const response = await request(app)
                .delete('/flashcards/existing-id-2');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Fiszka usunieta.');
            expect(response.body.flashcard).toEqual({
                    id: 'existing-id-2',
                    question: 'What is React?',
                    answer: 'A JavaScript library for building user interfaces',
                    category: 'Programming',
                    sourceLang: 'en',
                    targetLang: 'en'
            });
            
            expect(mockDb.data.flashcards).toHaveLength(2);
            expect(mockDb.data.flashcards.find(f => f.id === 'existing-id-2')).toBeUndefined();
            expect(mockDb.write).toHaveBeenCalled();
        });
        
        it('should return 404 if flashcard does not exist', async () => {
            const response = await request(app)
                .delete('/flashcards/non-existent-id');
            
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Fiszka nie została znaleziona.');
            expect(mockDb.data.flashcards).toHaveLength(3);
            expect(mockDb.write).not.toHaveBeenCalled()
        });
    });

    describe('getFlashcard', () => {
        it('should return all flashcards', async () => {
            const response = await request(app)
                .get('/flashcards')
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('flashcards');
            expect(response.body.flashcards).toHaveLength(3);
            expect(response.body.flashcards).toEqual(mockDb.data.flashcards);
        });

        it('should return empty array if no flashcards exist', async () => {
            mockDb.data.flashcards = [];

            const response = await request(app)
                .get('/flashcards');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('flashcards');
            expect(response.body.flashcards).toHaveLength(0);
            expect(response.body.flashcards).toEqual([]);
        });
    });
    
    describe('deleteCategory', () => {
        it('should delete all flashcard in a category', async () => {
            const response = await request(app)
                .delete('/categories/Programming');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', "Usunieto 2 fiszek z kategori 'Programming'.");
            expect(mockDb.data.flashcards).toHaveLength(1);
            expect(mockDb.data.flashcards[0].category).toBe('Polish');
            expect(mockDb.write).toHaveBeenCalled();
        });

        it('should return 404 if category does not exist', async () => {
            const response = await request(app)
                .delete('/categories/NonExistentCategory');

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Nie znaleziono fiszek w tej kategori');
            expect(mockDb.data.flashcards).toHaveLength(3);
            expect(mockDb.write).not.toHaveBeenCalled();
        });
    });

    describe('getCategories', () => {
        it('should return all unique categories', async () => {
            const response = await request(app)
                .get('/categories');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('categories');
            expect(response.body.categories).toHaveLength(2);
            expect(response.body.categories).toContain('Programming');
            expect(response.body.categories).toContain('Polish');
        });

        it('should return empty array if no flashcards exists', async() => {
            mockDb.data.flashcards = [];

            const response = await request(app)
                .get('/categories')
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('categories');
            expect(response.body.categories).toHaveLength(0);
            expect(response.body.categories).toEqual([]);
        });
    });

    describe('addSetFlashcards', () => {
        it('should add multiple flashcards successfully', async() => {
            // Verify mock is working before the test
            expect(crypto.randomUUID()).toBe('mock-uuid-123');

            const setFlashcard = [
                {
                    question: 'Set Question 1',
                    answer: 'Set Answer 1',
                    category: 'Set Category',
                    sourceLang: 'en',
                    targetLang: 'pl'
                },
                {
                    question: 'Set Question 2',
                    answer: 'Set Answer 2',
                    category: 'Set Category',
                    sourceLang: 'en',
                    targetLang: 'pl'
                }
            ];

            const response = await request(app)
                .post('/flashcards/bulk')
                .send(setFlashcard);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('message', 'Dodano 2 fiszek.');
            expect(mockDb.data.flashcards).toHaveLength(5);
            expect(mockDb.data.flashcards[3].id).toBe('mock-uuid-123');
            expect(mockDb.data.flashcards[4].id).toBe('mock-uuid-123');
            expect(mockDb.write).toHaveBeenCalled();
        });

        it('should return 400 if input is not an array', async() => {
            const InvalidInput = {
                question: 'Not an array',
                answer: 'This should fail',
                category: 'Invalid',
                sourceLang: 'en',
                targetLang: 'pl'
            };

            const response = await request(app)
                .post('/flashcards/bulk')
                .send(InvalidInput);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', "Oczekiwano tablicy fiszek. ");
            expect(mockDb.data.flashcards).toHaveLength(3);
            expect(mockDb.write).not.toHaveBeenCalled();
        })
    });
});