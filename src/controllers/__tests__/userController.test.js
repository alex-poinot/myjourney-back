import { vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import UserController from '../userController.js';
import UserService from '../../services/userService.js';

// Mock du service
vi.mock('../../services/userService.js');

describe('UserController', () => {
  let app;
  let userController;
  let mockUserService;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Créer une app Express pour les tests
    app = express();
    app.use(express.json());
    
    // Mock du service avec les méthodes nécessaires
    mockUserService = {
      getAllUsers: vi.fn(),
      getUserById: vi.fn(),
      createUser: vi.fn(),
      updateUser: vi.fn(),
      deleteUser: vi.fn()
    };
    
    // Mock du constructeur UserService
    UserService.mockImplementation(() => mockUserService);
    
    userController = new UserController();
    
    // Routes de test
    app.get('/users', userController.getAllUsers);
    app.get('/users/:id', userController.getUserById);
    app.post('/users', userController.createUser);
    app.put('/users/:id', userController.updateUser);
    app.delete('/users/:id', userController.deleteUser);
  });

  describe('GET /users', () => {
    it('devrait retourner tous les utilisateurs', async () => {
      // Arrange
      const mockResponse = {
        success: true,
        data: [{ USR_ID: 1, USR_NOM: 'Test', USR_MAIL: 'test@test.com' }],
        count: 1
      };
      mockUserService.getAllUsers.mockResolvedValue(mockResponse);

      // Act
      const response = await request(app).get('/users');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.timestamp).toBeDefined();
      expect(mockUserService.getAllUsers).toHaveBeenCalledTimes(1);
    });

    it('devrait gérer les erreurs du service', async () => {
      // Arrange
      const mockError = {
        status: 500,
        message: 'Erreur serveur'
      };
      mockUserService.getAllUsers.mockRejectedValue(mockError);

      // Act
      const response = await request(app).get('/users');

      // Assert
      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
    });

    it('devrait retourner un tableau vide si aucun utilisateur', async () => {
      // Arrange
      const mockResponse = {
        success: true,
        data: [],
        count: 0
      };
      mockUserService.getAllUsers.mockResolvedValue(mockResponse);

      // Act
      const response = await request(app).get('/users');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.count).toBe(0);
    });
  });

  describe('GET /users/:id', () => {
    it('devrait retourner un utilisateur par ID', async () => {
      // Arrange
      const mockResponse = {
        success: true,
        data: { USR_ID: 1, USR_NOM: 'Test', USR_MAIL: 'test@test.com' }
      };
      mockUserService.getUserById.mockResolvedValue(mockResponse);

      // Act
      const response = await request(app).get('/users/1');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.USR_ID).toBe(1);
      expect(mockUserService.getUserById).toHaveBeenCalledWith('1');
    });

    it('devrait retourner 404 si utilisateur non trouvé', async () => {
      // Arrange
      const mockError = {
        status: 404,
        message: 'Utilisateur non trouvé'
      };
      mockUserService.getUserById.mockRejectedValue(mockError);

      // Act
      const response = await request(app).get('/users/999');

      // Assert
      expect(response.status).toBe(404);
    });
  });

  describe('POST /users', () => {
    it('devrait créer un nouvel utilisateur', async () => {
      // Arrange
      const userData = { nom: 'Nouveau', email: 'nouveau@test.com' };
      const mockResponse = {
        success: true,
        data: { USR_ID: 1, ...userData },
        message: 'Utilisateur créé avec succès'
      };
      mockUserService.createUser.mockResolvedValue(mockResponse);

      // Act
      const response = await request(app)
        .post('/users')
        .send(userData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Utilisateur créé avec succès');
      expect(mockUserService.createUser).toHaveBeenCalledWith(userData);
    });

    it('devrait retourner 400 pour des données invalides', async () => {
      // Arrange
      const mockError = {
        status: 400,
        message: 'Données invalides'
      };
      mockUserService.createUser.mockRejectedValue(mockError);

      // Act
      const response = await request(app)
        .post('/users')
        .send({});

      // Assert
      expect(response.status).toBe(400);
    });
  });

  describe('PUT /users/:id', () => {
    it('devrait mettre à jour un utilisateur', async () => {
      // Arrange
      const userData = { nom: 'Modifié', email: 'modifie@test.com' };
      const mockResponse = {
        success: true,
        data: { USR_ID: 1, ...userData },
        message: 'Utilisateur mis à jour avec succès'
      };
      mockUserService.updateUser.mockResolvedValue(mockResponse);

      // Act
      const response = await request(app)
        .put('/users/1')
        .send(userData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Utilisateur mis à jour avec succès');
      expect(mockUserService.updateUser).toHaveBeenCalledWith('1', userData);
    });
  });

  describe('DELETE /users/:id', () => {
    it('devrait supprimer un utilisateur', async () => {
      // Arrange
      const mockResponse = {
        success: true,
        data: { USR_ID: 1, USR_NOM: 'Supprimé' },
        message: 'Utilisateur supprimé avec succès'
      };
      mockUserService.deleteUser.mockResolvedValue(mockResponse);

      // Act
      const response = await request(app).delete('/users/1');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Utilisateur supprimé avec succès');
      expect(mockUserService.deleteUser).toHaveBeenCalledWith('1');
    });
  });
});