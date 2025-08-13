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
    let mockUser;

    beforeEach(() => {
        // Ensure the mock is still in place
        crypto.randomUUID = jest.fn().mockReturnValue('mock-uuid-123');
        
        // Setup Express app for testing
        app = express();
        app.use(express.json());

        // Mock user for authentication
        mockUser = {
            userId: 'user-123', // Changed from id to userId to match controller expectations
            username: 'testuser',
            email: 'test@example.com'
        };

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
                        box: 2,
                        userId: 'user-123'
                    },
                    {
                        id: 'existing-id-2',
                        question: 'What is React?',
                        answer: 'A JavaScript library for building user interfaces',
                        category: 'Programming',
                        sourceLang: 'en',
                        targetLang: 'en',
                        box: 3,
                        userId: 'user-123'
                    },
                    {
                        id: 'existing-id-3',
                        question: 'Hej',
                        answer: 'Hello',
                        category: 'Polish',
                        sourceLang: 'pl',
                        targetLang: 'en',
                        box: 1,
                        userId: 'user-123'
                    }
                ],
                users: [
                    {
                        id: 'user-123',
                        username: 'testuser',
                        email: 'test@example.com',
                        correctAnswers: 15,
                        wrongAnswers: 5
                    }
                ]
            },
            read: jest.fn().mockResolvedValue(),
            write: jest.fn().mockResolvedValue()
        };

        // Add mockDb and mockUser to request object
        app.use((req, res, next) => {
            req.db = mockDb;
            req.user = mockUser; // Mock authenticated user
            next();
        });

        // Add error handling middleware
        app.use((err, req, res, next) => {
            res.status(500).json({ message: err.message || 'An error occurred' });
        });

        // Setup routes with the controller functions
        app.post('/flashcards', flashcardController.addFlashcard);
        app.put('/flashcards/:id/box', flashcardController.updateFlashcardBox);
        app.put('/flashcards/:id', flashcardController.editFlashcard);
        app.delete('/flashcards/:id', flashcardController.deleteFlashcard);
        app.get('/flashcards', flashcardController.getFlashcards);
        app.get('/flashcards/:id', flashcardController.getFlashcardById);
        app.delete('/categories/:category', flashcardController.deleteCategory);
        app.get('/categories', flashcardController.getCategories);
        app.post('/flashcards/bulk', flashcardController.addBulkFlashcards);
        app.get('/stats', flashcardController.getFlashcardStats);
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

            const response = await request(app)
                .post('/flashcards')
                .send(newFlashcard);

            expect(response.status).toBe(201);
            expect(response.body).toEqual({
                id: 'mock-uuid-123',
                ...newFlashcard,
                box: 1,
                userId: 'user-123'
            });
            expect(mockDb.data.flashcards).toHaveLength(4);
            expect(mockDb.write).toHaveBeenCalled();
        });

        it('should return 400 if required fields are missing', async () => {
            const incompleteFlashcard = {
                question: 'Incomplete question',
                // Missing answer
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

    describe('updateFlashcardBox', () => {
        it('should update box level successfully', async () => {
            const response = await request(app)
                .put('/flashcards/existing-id-1/box')
                .send({ box: 4 });
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Zaktualizowano poziom boxa na 4.');
            expect(response.body).toHaveProperty('flashcard');
            expect(response.body.flashcard.box).toBe(4);
            expect(mockDb.data.flashcards[0].box).toBe(4);
            expect(mockDb.write).toHaveBeenCalled();
        });

        it('should return 400 if box level is invalid', async () => {
            const response = await request(app)
                .put('/flashcards/existing-id-1/box')
                .send({ box: 6 }); // Invalid box level
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Nieprawidłowy poziom boxa. Musi być liczbą od 1 do 5.');
            expect(mockDb.data.flashcards[0].box).toBe(2); // Unchanged
            expect(mockDb.write).not.toHaveBeenCalled();
        });

        it('should return 404 if flashcard does not exist', async () => {
            const response = await request(app)
                .put('/flashcards/non-existent-id/box')
                .send({ box: 3 });
            
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Fiszka nie została znaleziona.');
            expect(mockDb.write).not.toHaveBeenCalled();
        });

        it('should return 403 if user does not own the flashcard', async () => {
            // Add a flashcard owned by another user
            mockDb.data.flashcards.push({
                id: 'other-user-flashcard',
                question: 'Other User Question',
                answer: 'Other User Answer',
                category: 'Other',
                box: 1,
                userId: 'other-user-id'
            });

            const response = await request(app)
                .put('/flashcards/other-user-flashcard/box')
                .send({ box: 3 });

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('message', 'Brak uprawnień do edycji tej fiszki.');
            expect(mockDb.write).not.toHaveBeenCalled();
        });
    });

    describe('editFlashcard', () => {
        it('should edit an existing flashcard successfully', async () => {
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
            expect(response.body).toEqual({
                id: 'existing-id-1',
                ...updatedFlashcard,
                box: 2,
                userId: 'user-123'
            });
            expect(mockDb.data.flashcards[0]).toEqual({
                id: 'existing-id-1',
                ...updatedFlashcard,
                box: 2,
                userId: 'user-123'
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

        it('should return 403 if user does not own the flashcard', async () => {
            // Add a flashcard owned by another user
            mockDb.data.flashcards.push({
                id: 'other-user-flashcard',
                question: 'Other User Question',
                answer: 'Other User Answer',
                category: 'Other',
                userId: 'other-user-id'
            });

            const updatedFlashcard = {
                question: 'Trying to update',
                answer: 'Should fail',
                category: 'Updated'
            };

            const response = await request(app)
                .put('/flashcards/other-user-flashcard')
                .send(updatedFlashcard);

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('message', 'Brak uprawnień do edycji tej fiszki.');
            expect(mockDb.write).not.toHaveBeenCalled();
        });
    });

    describe('deleteFlashcard', () => {
        it('should delete an existing flashcard successfully', async () => {
            const response = await request(app)
                .delete('/flashcards/existing-id-2');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Fiszka usunięta.');
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

        it('should return 403 if user does not own the flashcard', async () => {
            // Add a flashcard owned by another user
            mockDb.data.flashcards.push({
                id: 'other-user-flashcard',
                question: 'Other User Question',
                answer: 'Other User Answer',
                category: 'Other',
                userId: 'other-user-id'
            });

            const response = await request(app)
                .delete('/flashcards/other-user-flashcard');

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('message', 'Brak uprawnień do usunięcia tej fiszki.');
            expect(mockDb.write).not.toHaveBeenCalled();
        });
    });

    describe('getFlashcardById', () => {
        it('should return a specific flashcard by ID', async () => {
            const response = await request(app)
                .get('/flashcards/existing-id-1');
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockDb.data.flashcards[0]);
        });

        it('should return 404 if flashcard does not exist', async () => {
            const response = await request(app)
                .get('/flashcards/non-existent-id');
            
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Fiszka nie została znaleziona.');
        });

        it('should return 403 if user does not own the flashcard', async () => {
            // Add a flashcard owned by another user
            mockDb.data.flashcards.push({
                id: 'other-user-flashcard',
                question: 'Other User Question',
                answer: 'Other User Answer',
                category: 'Other',
                userId: 'other-user-id'
            });

            const response = await request(app)
                .get('/flashcards/other-user-flashcard');

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('message', 'Brak uprawnień do wyświetlenia tej fiszki.');
        });
    });

    describe('getFlashcards', () => {
        it('should return all flashcards for the user', async () => {
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

        it('should only return flashcards owned by the user', async () => {
            // Add flashcards owned by another user
            mockDb.data.flashcards.push(
                {
                    id: 'other-user-1',
                    question: 'Other User Question 1',
                    answer: 'Other User Answer 1',
                    category: 'Other',
                    userId: 'other-user-id'
                },
                {
                    id: 'other-user-2',
                    question: 'Other User Question 2',
                    answer: 'Other User Answer 2',
                    category: 'Other',
                    userId: 'other-user-id'
                }
            );

            const response = await request(app)
                .get('/flashcards');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('flashcards');
            // Should still only return the original 3 flashcards owned by the user
            expect(response.body.flashcards.length).toBe(3);
            expect(response.body.flashcards.every(f => f.userId === 'user-123')).toBe(true);
        });
    });
    
    describe('deleteCategory', () => {
        it('should delete all flashcards in a category for the user', async () => {
            const response = await request(app)
                .delete('/categories/Programming');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', "Usunięto 2 fiszek z kategorii 'Programming'.");
            expect(mockDb.data.flashcards).toHaveLength(1);
            expect(mockDb.data.flashcards[0].category).toBe('Polish');
            expect(mockDb.write).toHaveBeenCalled();
        });

        it('should return 404 if category does not exist', async () => {
            const response = await request(app)
                .delete('/categories/NonExistentCategory');

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Nie znaleziono fiszek w tej kategorii');
            expect(mockDb.data.flashcards).toHaveLength(3);
            expect(mockDb.write).not.toHaveBeenCalled();
        });

        it('should only delete flashcards owned by the user', async () => {
            // Add a flashcard in the Programming category owned by another user
            mockDb.data.flashcards.push({
                id: 'other-user-programming',
                question: 'Other User Programming Question',
                answer: 'Other User Programming Answer',
                category: 'Programming',
                userId: 'other-user-id'
            });

            const response = await request(app)
                .delete('/categories/Programming');
            
            expect(response.status).toBe(200);
            // Should only delete the 2 Programming flashcards owned by the user
            expect(response.body).toHaveProperty('message', "Usunięto 2 fiszek z kategorii 'Programming'.");
            // Should have 2 flashcards left (Polish + other user's Programming)
            expect(mockDb.data.flashcards).toHaveLength(2);
            expect(mockDb.write).toHaveBeenCalled();
        });
    });

     describe('getCategories', () => {
        it('should return all unique categories for the user', async () => {
            const response = await request(app)
                .get('/categories');
            
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(2);
            expect(response.body).toContain('Programming');
            expect(response.body).toContain('Polish');
        });

        it('should return empty array if no flashcards exist', async() => {
            mockDb.data.flashcards = [];

            const response = await request(app)
                .get('/categories')
            
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(0);
        });

        it('should only return categories for flashcards owned by the user', async() => {
            // Add flashcards with different categories owned by another user
            mockDb.data.flashcards.push(
                {
                    id: 'other-user-1',
                    question: 'Other User Question 1',
                    answer: 'Other User Answer 1',
                    category: 'OtherCategory1',
                    userId: 'other-user-id'
                },
                {
                    id: 'other-user-2',
                    question: 'Other User Question 2',
                    answer: 'Other User Answer 2',
                    category: 'OtherCategory2',
                    userId: 'other-user-id'
                }
            );

            const response = await request(app)
                .get('/categories');
            
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            // Should only return the original 2 categories
            expect(response.body.length).toBe(2);
            expect(response.body).toContain('Programming');
            expect(response.body).toContain('Polish');
            // Should not contain categories from other users
            expect(response.body).not.toContain('OtherCategory1');
            expect(response.body).not.toContain('OtherCategory2');
        });
    });

    describe('addBulkFlashcards', () => {
        it('should add multiple flashcards successfully', async() => {
            // Verify mock is working before the test
            expect(crypto.randomUUID()).toBe('mock-uuid-123');

            const bulkFlashcards = [
                {
                    question: 'Bulk Question 1',
                    answer: 'Bulk Answer 1',
                    category: 'Bulk Category',
                    sourceLang: 'en',
                    targetLang: 'pl'
                },
                {
                    question: 'Bulk Question 2',
                    answer: 'Bulk Answer 2',
                    category: 'Bulk Category',
                    sourceLang: 'en',
                    targetLang: 'pl'
                }
            ];

            const response = await request(app)
                .post('/flashcards/bulk')
                .send(bulkFlashcards);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('message', 'Dodano 2 fiszek.');
            expect(response.body).toHaveProperty('flashcards');
            expect(response.body.flashcards.length).toBe(2);
            expect(mockDb.data.flashcards).toHaveLength(5);
            
            // Check that user ID was added to each flashcard
            expect(mockDb.data.flashcards[3].userId).toBe('user-123');
            expect(mockDb.data.flashcards[4].userId).toBe('user-123');
            
            // Check that UUID was used for IDs
            expect(mockDb.data.flashcards[3].id).toBe('mock-uuid-123');
            expect(mockDb.data.flashcards[4].id).toBe('mock-uuid-123');
            
            expect(mockDb.write).toHaveBeenCalled();
        });

        it('should return 400 if input is not an array', async() => {
            const invalidInput = {
                question: 'Not an array',
                answer: 'This should fail',
                category: 'Invalid',
                sourceLang: 'en',
                targetLang: 'pl'
            };

            const response = await request(app)
                .post('/flashcards/bulk')
                .send(invalidInput);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', "Oczekiwano tablicy fiszek.");
            expect(mockDb.data.flashcards).toHaveLength(3);
            expect(mockDb.write).not.toHaveBeenCalled();
        });
    });

    describe('getFlashcardStats', () => {
        it('should return correct statistics for user flashcards', async () => {
            const response = await request(app)
                .get('/stats');
            
            expect(response.status).toBe(200);
            
            // Check stats structure
            expect(response.body).toHaveProperty('stats');
            expect(response.body).toHaveProperty('correctAnswers', 15);
            expect(response.body).toHaveProperty('wrongAnswers', 5);
            expect(response.body).toHaveProperty('correctPercentage', 75); // 15/(15+5) * 100
            
            // Check stats content
            expect(response.body.stats).toHaveLength(2); // Programming and Polish categories
            
            // Find Programming category stats
            const programmingStats = response.body.stats.find(s => s.category === 'Programming');
            expect(programmingStats).toBeDefined();
            expect(programmingStats.numberOfFlashcards).toBe(2);
            expect(programmingStats.averageBoxLevel).toBe(2.5); // (2+3)/2
            expect(programmingStats.sourceLanguages).toContain('en');
            expect(programmingStats.targetLanguages).toContain('en');
            
            // Find Polish category stats
            const polishStats = response.body.stats.find(s => s.category === 'Polish');
            expect(polishStats).toBeDefined();
            expect(polishStats.numberOfFlashcards).toBe(1);
            expect(polishStats.averageBoxLevel).toBe(1);
            expect(polishStats.sourceLanguages).toContain('pl');
            expect(polishStats.targetLanguages).toContain('en');
        });

        it('should handle users with no flashcards', async () => {
            // Setup empty flashcards for the user
            mockDb.data.flashcards = [
                {
                    id: 'card-1',
                    question: 'Question 1',
                    answer: 'Answer 1',
                    category: 'Programming',
                    userId: 'other-user'
                }
            ];

            const response = await request(app)
                .get('/stats');

            // Assertions
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('stats');
            expect(response.body.stats).toHaveLength(0);
            expect(response.body).toHaveProperty('correctAnswers', 15);
            expect(response.body).toHaveProperty('wrongAnswers', 5);
            expect(response.body).toHaveProperty('correctPercentage', 75);
        });

        it('should handle non-existent user', async () => {
            // Remove the user from the database
            mockDb.data.users = [];

            const response = await request(app)
                .get('/stats');

            // Assertions
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('stats');
            expect(response.body.stats).toHaveLength(2); // Still has flashcard stats
            expect(response.body).toHaveProperty('correctAnswers', 0);
            expect(response.body).toHaveProperty('wrongAnswers', 0);
            expect(response.body).toHaveProperty('correctPercentage', null);
        });

        it('should handle flashcards with missing box values', async () => {
            // Add a flashcard with missing box value
            mockDb.data.flashcards.push({
                id: 'no-box-card',
                question: 'No Box Question',
                answer: 'No Box Answer',
                category: 'NoBox',
                sourceLang: 'en',
                targetLang: 'pl',
                // No box value
                userId: 'user-123'
            });

            const response = await request(app)
                .get('/stats');

            // Assertions
            expect(response.status).toBe(200);
            
            // Find NoBox category stats
            const noBoxStats = response.body.stats.find(s => s.category === 'NoBox');
            expect(noBoxStats).toBeDefined();
            expect(noBoxStats.numberOfFlashcards).toBe(1);
            expect(noBoxStats.averageBoxLevel).toBeNaN(); // or could be 0 depending on implementation
        });

        it('should filter out flashcards from other users', async () => {
            // Add a flashcard owned by another user
            mockDb.data.flashcards.push({
                id: 'other-user-card',
                question: 'Other User Question',
                answer: 'Other User Answer',
                category: 'Programming',
                box: 5,
                userId: 'other-user-id'
            });

            const response = await request(app)
                .get('/stats');

            // Assertions
            expect(response.status).toBe(200);
            
            // Programming stats should not include the other user's flashcard
            const programmingStats = response.body.stats.find(s => s.category === 'Programming');
            expect(programmingStats).toBeDefined();
            expect(programmingStats.numberOfFlashcards).toBe(2); // Still only 2
            expect(programmingStats.averageBoxLevel).toBe(2.5); // Still (2+3)/2
        });
    });

    describe('Authentication and Authorization', () => {
        it('should handle missing user in request', async () => {
            // Create a new app instance without the user in the request
            const appWithoutUser = express();
            appWithoutUser.use(express.json());
            
            // Add only mockDb to request object
            appWithoutUser.use((req, res, next) => {
                req.db = mockDb;
                // No user added
                next();
            });
            
            appWithoutUser.get('/flashcards', flashcardController.getFlashcards);
            
            // This should fail or handle the missing user gracefully
            const response = await request(appWithoutUser)
                .get('/flashcards');
            
            // The controller should handle missing user (either by returning an error or empty results)
            expect(response.status).toBe(200); // or could be 401/403 depending on implementation
            
            // If it returns 200, it should at least return an empty array
            if (response.status === 200) {
                expect(response.body).toHaveProperty('flashcards');
                expect(Array.isArray(response.body.flashcards)).toBe(true);
                expect(response.body.flashcards.length).toBe(0);
            }
        });
        
        it('should filter flashcards by user ID', async () => {
            // Add flashcards for multiple users
            mockDb.data.flashcards = [
                {
                    id: 'user1-flashcard-1',
                    question: 'User 1 Question 1',
                    answer: 'User 1 Answer 1',
                    category: 'User1Category',
                    userId: 'user-1'
                },
                {
                    id: 'user1-flashcard-2',
                    question: 'User 1 Question 2',
                    answer: 'User 1 Answer 2',
                    category: 'User1Category',
                    userId: 'user-1'
                },
                {
                    id: 'user2-flashcard-1',
                    question: 'User 2 Question 1',
                    answer: 'User 2 Answer 1',
                    category: 'User2Category',
                                      userId: 'user-2'
                },
                {
                    id: 'user2-flashcard-2',
                    question: 'User 2 Question 2',
                    answer: 'User 2 Answer 2',
                    category: 'User2Category',
                    userId: 'user-2'
                }
            ];
            
            // Create apps for different users
            const appUser1 = express();
            appUser1.use(express.json());
            appUser1.use((req, res, next) => {
                req.db = mockDb;
                req.user = { userId: 'user-1' }; // Changed from id to userId
                next();
            });
            appUser1.get('/flashcards', flashcardController.getFlashcards);
            
            const appUser2 = express();
            appUser2.use(express.json());
            appUser2.use((req, res, next) => {
                req.db = mockDb;
                req.user = { userId: 'user-2' }; // Changed from id to userId
                next();
            });
            appUser2.get('/flashcards', flashcardController.getFlashcards);
            
            // Test user 1 sees only their flashcards
            const responseUser1 = await request(appUser1).get('/flashcards');
            expect(responseUser1.status).toBe(200);
            expect(responseUser1.body).toHaveProperty('flashcards');
            expect(responseUser1.body.flashcards.length).toBe(2);
            expect(responseUser1.body.flashcards.every(f => f.userId === 'user-1')).toBe(true);
            
            // Test user 2 sees only their flashcards
            const responseUser2 = await request(appUser2).get('/flashcards');
            expect(responseUser2.status).toBe(200);
            expect(responseUser2.body).toHaveProperty('flashcards');
            expect(responseUser2.body.flashcards.length).toBe(2);
            expect(responseUser2.body.flashcards.every(f => f.userId === 'user-2')).toBe(true);
        });
    });

    describe('Error Handling', () => {
        it('should handle database read errors', async () => {
            // Mock a database read error
            mockDb.read = jest.fn().mockRejectedValue(new Error('Database read error'));
            
            const response = await request(app)
                .get('/flashcards');
            
            // The controller should handle the error gracefully
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('message');
        });
        
        it('should handle database write errors', async () => {
            // Mock a database write error
            mockDb.write = jest.fn().mockRejectedValue(new Error('Database write error'));
            
            const newFlashcard = {
                question: 'New Question',
                answer: 'New Answer',
                category: 'New Category',
                sourceLang: 'en',
                targetLang: 'pl'
            };
            
            const response = await request(app)
                .post('/flashcards')
                .send(newFlashcard);
            
            // The controller should handle the error gracefully
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('message');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty database', async () => {
            // Set up an empty database
            mockDb.data = { flashcards: [], users: [] };
            
            const response = await request(app)
                .get('/flashcards');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('flashcards');
            expect(response.body.flashcards).toHaveLength(0);
        });
        
        it('should handle malformed request bodies', async () => {
            // Test with various malformed bodies
            const testCases = [
                { body: null, expectedStatus: 400 },
                { body: undefined, expectedStatus: 400 },
                { body: '', expectedStatus: 400 },
                { body: {}, expectedStatus: 400 },
                { body: [], expectedStatus: 400 }
            ];
            
            for (const testCase of testCases) {
                const response = await request(app)
                    .post('/flashcards')
                    .send(testCase.body);
                
                expect(response.status).toBe(testCase.expectedStatus);
            }
        });
        
        it('should sanitize inputs to prevent injection attacks', async () => {
            const maliciousFlashcard = {
                question: '<script>alert("XSS")</script>',
                answer: 'Malicious answer',
                category: 'Malicious category',
                sourceLang: 'en',
                targetLang: 'pl'
            };
            
            const response = await request(app)
                .post('/flashcards')
                .send(maliciousFlashcard);
            
            // The controller should sanitize the input or handle it safely
            expect(response.status).toBe(201);
            
            // Check if the script tag was sanitized or escaped
            // This depends on your implementation - adjust as needed
            const savedFlashcard = mockDb.data.flashcards.find(f => f.id === 'mock-uuid-123');
            expect(savedFlashcard.question).not.toContain('<script>');
        });
    });
});