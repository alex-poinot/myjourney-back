import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import userRoutes from '../userRoutes.js';
import UserController from '../../controllers/userController.js';

// Mock du contrôleur

describe('User Routes', () => {
  let app;
  let mockController;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock des méthodes du contrôleur
    mockController = {
      getAllUsers: jest.fn((req, res) => res.json({ success: true, data: [] })),
      getUserById: jest.fn((req, res) => res.json({ success: true, data: { id: req.params.id } })),
      createUser: jest.fn((req, res) => res.status(201).json({ success: true, data: req.body })),
      updateUser: jest.fn((req, res) => res.json({ success: true, data: { id: req.params.id, ...req.body } })),
      deleteUser: jest.fn((req, res) => res.json({ success: true, message: 'Utilisateur supprimé' }))
    };
    
    // Mock du constructeur UserController
    UserController.mockImplementation(() => mockController);
    
    app = express();
    app.use(express.json());
    app.use('/api/users', userRoutes);
  });

  describe('GET /api/users', () => {
    it('devrait retourner la liste des utilisateurs', async () => {
      const response = await request(app).get('/api/users');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(mockController.getAllUsers).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/users/:id', () => {
    it('devrait retourner un utilisateur par ID', async () => {
      const response = await request(app).get('/api/users/123');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('123');
      expect(mockController.getUserById).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/users', () => {
    it('devrait créer un nouvel utilisateur', async () => {
      const userData = { nom: 'Test', email: 'test@test.com' };
      const response = await request(app)
        .post('/api/users')
        .send(userData);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(userData);
      expect(mockController.createUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('devrait mettre à jour un utilisateur', async () => {
      const userData = { nom: 'Test Modifié', email: 'test@test.com' };
      const response = await request(app)
        .put('/api/users/123')
        .send(userData);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('123');
      expect(response.body.data.nom).toBe('Test Modifié');
      expect(mockController.updateUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('devrait supprimer un utilisateur', async () => {
      const response = await request(app).delete('/api/users/123');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Utilisateur supprimé');
      expect(mockController.deleteUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('Routes invalides', () => {
    it('devrait retourner 404 pour une route inexistante', async () => {
      const response = await request(app).get('/api/users/invalid/route');
      
      expect(response.status).toBe(404);
    });
  });
});