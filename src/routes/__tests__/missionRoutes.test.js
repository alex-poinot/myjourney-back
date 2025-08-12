import { vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import missionRoutes from '../missionRoutes.js';
import MissionController from '../../controllers/missionController.js';
import { notFoundHandler, errorHandler } from '../../utils/errorHandlers.js';

// Mock du contrôleur avec implémentation directe
vi.mock('../../controllers/missionController.js', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      getAllMissionsDashboard: vi.fn((req, res) => {
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
    }))
  };
});

describe('Mission Routes', () => {
  let app;

  beforeEach(() => {
    vi.clearAllMocks();
    
    app = express();
    app.use(express.json());
    app.use('/api/missions', missionRoutes);
    
    // Ajouter les middlewares de gestion d'erreur
    app.use(notFoundHandler);
    app.use(errorHandler);
  });

  describe('GET /api/missions/getAllMissionsDashboard/:email', () => {
    it('devrait retourner les missions pour un utilisateur', async () => {
      const email = 'test@example.com';
      const response = await request(app).get(`/api/missions/getAllMissionsDashboard/${email}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].email).toBe(email);
    });

    it('devrait gérer les emails avec des caractères spéciaux', async () => {
      const email = 'test+special@example.com';
      const response = await request(app).get(`/api/missions/getAllMissionsDashboard/${encodeURIComponent(email)}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Routes invalides', () => {
    it('devrait retourner 404 pour une route inexistante', async () => {
      const response = await request(app).get('/api/missions/invalid/route');
      
      expect(response.status).toBe(404);
    });
  });
});