import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";
import express from 'express';
import request from "supertest";
import * as flashcardController from '../../controllers/flashcardController.js'

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
        })
    });
        describe('editFlashcard', () => {
            it('should edit and existing flashcard successfully', async () => {
                const updatedFlashcard ={
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
            })

            it('should return 404 if flashcard does not exist', async () => {
                
                const updatedFlashcard ={
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
            })
        })

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
            
            it('should return 404 if flashcard does not exist', async () =>{
                const response = await request(app)
                    .delete('/flashcards/non-existent-id');
                
                expect(response.status).toBe(404);
                expect(response.body).toHaveProperty('message', 'Fiszka nie została znaleziona.');
                expect(mockDb.data.flashcards).toHaveLength(3);
                expect(mockDb.write).not.toHaveBeenCalled()
            });
        });

        describe('getFlashcard', () => {
            it('should return all flashcards', async () =>{
                const response = await request(app)
                    .get('/flashcards')
                
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('flashcards');
                expect(response.body.flashcards).toHaveLength(3);
                expect(response.body.flashcards).toEqual(mockDb.data.flashcards);
            });

            it('should return empty array if no flashcards exist', async () =>{
                mockDb.data.flashcards = [];

                const response = await request(app)
                    .get('/flashcards');

                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('flashcards');
                expect(response.body.flashcards).toHaveLength(0);
                expect(response.body.flashcards).toEqual([]);
            })
        });
    // Add more test blocks for other functions
});