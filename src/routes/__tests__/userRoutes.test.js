import { vi, describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import userRoutes from '../userRoutes.js';

// Ici on MOCK directement le module avec un objet statique
vi.mock('../../controllers/userController.js', () => {
  // Objet mocké du contrôleur avec méthode getAllUsers
  const mockController = {
    getAllUsers: vi.fn((req, res) => res.json({ success: true, data: [] })),
  };

  // On mock la classe par un constructeur qui retourne cet objet mock
  return {
    default: vi.fn().mockImplementation(() => mockController),
  };
});

import UserController from '../../controllers/userController.js'; // importer APRES le vi.mock

describe('User Routes', () => {
  let app;
  let mockControllerInstance;

  beforeEach(() => {
    vi.clearAllMocks();

    // Récupérer l'instance mockée créée par UserController
    mockControllerInstance = new UserController();

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
      expect(mockControllerInstance.getAllUsers).toHaveBeenCalledOnce();
    });
  });
});
