import { describe, it, expect, beforeEach, afterEach, jest, afterAll} from "@jest/globals";
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
            id: 'user-123',
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
                        userId: 'user-123'
                    },
                    {
                        id: 'existing-id-2',
                        question: 'What is React?',
                        answer: 'A JavaScript library for building user interfaces',
                        category: 'Programming',
                        sourceLang: 'en',
                        targetLang: 'en',
                        userId: 'user-123'
                    },
                    {
                        id: 'existing-id-3',
                        question: 'Hej',
                        answer: 'Hello',
                        category: 'Polish',
                        sourceLang: 'pl',
                        targetLang: 'en',
                        userId: 'user-123'
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

        // Setup routes with the controller functions
        app.post('/flashcards', flashcardController.addFlashcard);
        app.put('/flashcards/:id', flashcardController.editFlashcard);
        app.delete('/flashcards/:id', flashcardController.deleteFlashcard);
        app.get('/flashcards', flashcardController.getFlashcards); // Updated function name
        app.get('/flashcards/:id', flashcardController.getFlashcardById); // Added new route
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

            const response = await request(app)
                .post('/flashcards')
                .send(newFlashcard);

            expect(response.status).toBe(201);
            expect(response.body).toEqual({
                id: 'mock-uuid-123',
                ...newFlashcard,
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
                userId: 'user-123'
            });
            expect(mockDb.data.flashcards[0]).toEqual({
                id: 'existing-id-1',
                ...updatedFlashcard,
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
                req.user = { id: 'user-1' };
                next();
            });
            appUser1.get('/flashcards', flashcardController.getFlashcards);
            
            const appUser2 = express();
            appUser2.use(express.json());
            appUser2.use((req, res, next) => {
                req.db = mockDb;
                req.user = { id: 'user-2' };
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
});