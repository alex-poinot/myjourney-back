import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import missionRoutes from '../missionRoutes.js';
import MissionController from '../../controllers/missionController.js';

// Mock du contrôleur
jest.mock('../../controllers/missionController.js');

describe('Mission Routes', () => {
  let app;
  let mockController;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock des méthodes du contrôleur
    mockController = {
      getAllMissionsDashboard: jest.fn((req, res) => {
        res.json({ 
          success: true, 
          data: [{ 
            numeroGroupe: '001', 
            nomGroupe: 'Test Group',
            numeroClient: 'CLI001',
            nomClient: 'Test Client',
            mission: 'Mission EC',
            email: req.params.email 
          }] 
        });
      })
    };
    
    // Mock du constructeur MissionController
    MissionController.mockImplementation(() => mockController);
    
    app = express();
    app.use(express.json());
    app.use('/api/missions', missionRoutes);
  });

  describe('GET /api/missions/getAllMissionsDashboard/:email', () => {
    it('devrait retourner les missions pour un utilisateur', async () => {
      const email = 'test@example.com';
      const response = await request(app).get(`/api/missions/getAllMissionsDashboard/${email}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].email).toBe(email);
      expect(mockController.getAllMissionsDashboard).toHaveBeenCalledTimes(1);
    });

    it('devrait gérer les emails avec des caractères spéciaux', async () => {
      const email = 'test+special@example.com';
      const response = await request(app).get(`/api/missions/getAllMissionsDashboard/${encodeURIComponent(email)}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockController.getAllMissionsDashboard).toHaveBeenCalledTimes(1);
    });

    it('devrait gérer les emails vides', async () => {
      const email = '';
      const response = await request(app).get(`/api/missions/getAllMissionsDashboard/${email}`);
      
      expect(response.status).toBe(200);
      expect(mockController.getAllMissionsDashboard).toHaveBeenCalledTimes(1);
    });
  });

  describe('Routes invalides', () => {
    it('devrait retourner 404 pour une route inexistante', async () => {
      const response = await request(app).get('/api/missions/invalid/route');
      
      expect(response.status).toBe(404);
    });
  });
});