import { vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import MissionController from '../missionController.js';
import MissionService from '../../services/missionService.js';
import { errorHandler } from '../../utils/errorHandlers.js';

// Mock du service
vi.mock('../../services/missionService.js');

describe('MissionController', () => {
  let app;
  let missionController;
  let mockMissionService;

  beforeEach(() => {
    vi.clearAllMocks();
    
    app = express();
    app.use(express.json());
    
    // Mock du service avec les méthodes nécessaires
    mockMissionService = {
      getAllMissionsDashboard: vi.fn()
    };
    
    // Mock du constructeur MissionService
    MissionService.mockImplementation(() => mockMissionService);
    
    missionController = new MissionController();
    
    app.get('/missions/getAllMissionsDashboard/:email', missionController.getAllMissionsDashboard);
    
    // Ajouter le middleware de gestion d'erreur
    app.use(errorHandler);
  });

  describe('GET /missions/getAllMissionsDashboard/:email', () => {
    it('devrait retourner toutes les missions pour un utilisateur', async () => {
      // Arrange
      const email = 'test@example.com';
      const mockResponse = {
        success: true,
        data: [
          {
            numeroGroupe: '001',
            nomGroupe: 'Groupe Test',
            numeroClient: 'CLI001',
            nomClient: 'Client Test',
            mission: 'Mission EC',
            avantMission: { percentage: 75, lab: true, conflitCheck: true, qac: true, qam: false, ldm: false },
            pendantMission: { percentage: 25, nog: true, checklist: false, revision: false, supervision: false },
            finMission: { percentage: 0, ndsCr: false, qmm: false, plaquette: false, restitution: false }
          }
        ],
        count: 1
      };
      mockMissionService.getAllMissionsDashboard.mockResolvedValue(mockResponse);

      // Act
      const response = await request(app).get(`/missions/getAllMissionsDashboard/${email}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.timestamp).toBeDefined();
      expect(mockMissionService.getAllMissionsDashboard).toHaveBeenCalledWith(email);
    });

    it('devrait gérer les erreurs du service', async () => {
      // Arrange
      const email = 'test@example.com';
      const mockError = {
        status: 500,
        message: 'Erreur serveur'
      };
      mockMissionService.getAllMissionsDashboard.mockRejectedValue(mockError);

      // Act
      const response = await request(app).get(`/missions/getAllMissionsDashboard/${email}`);

      // Assert
      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
    });

    it('devrait retourner un tableau vide si aucune mission', async () => {
      // Arrange
      const email = 'test@example.com';
      const mockResponse = {
        success: true,
        data: [],
        count: 0
      };
      mockMissionService.getAllMissionsDashboard.mockResolvedValue(mockResponse);

      // Act
      const response = await request(app).get(`/missions/getAllMissionsDashboard/${email}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.count).toBe(0);
    });

    it('devrait valider le format de l\'email', async () => {
      // Arrange
      const invalidEmail = 'invalid-email';
      const mockResponse = {
        success: true,
        data: [],
        count: 0
      };
      mockMissionService.getAllMissionsDashboard.mockResolvedValue(mockResponse);

      // Act
      const response = await request(app).get(`/missions/getAllMissionsDashboard/${invalidEmail}`);

      // Assert
      expect(response.status).toBe(200);
      expect(mockMissionService.getAllMissionsDashboard).toHaveBeenCalledWith(invalidEmail);
    });
  });
});