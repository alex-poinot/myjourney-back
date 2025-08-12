import { vi, describe, it, expect, beforeEach } from 'vitest';
import { errorHandler, notFoundHandler, asyncHandler } from '../errorHandlers.js';

// Mock du logger
vi.mock('../logger.js', () => ({
  __esModule: true,
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
  }
}));

describe('Error Handlers', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockReq = {
      url: '/test',
      method: 'GET',
      ip: '127.0.0.1'
    };
    
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    
    mockNext = vi.fn();
  });

  describe('errorHandler', () => {
    it('devrait gérer les erreurs de validation', () => {
      // Arrange
      const error = {
        name: 'ValidationError',
        message: 'Erreur de validation',
        errors: { field: 'required' }
      };

      // Act
      errorHandler(error, mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erreur de validation',
        message: 'Erreur de validation',
        details: { field: 'required' }
      });
    });

    it('devrait gérer les erreurs de base de données', () => {
      // Arrange
      const error = {
        code: 'E_DATABASE_ERROR',
        message: 'Erreur DB'
      };

      // Act
      errorHandler(error, mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erreur de base de données',
        message: 'Une erreur s\'est produite lors de l\'accès aux données'
      });
    });

    it('devrait gérer les erreurs avec status personnalisé', () => {
      // Arrange
      const error = {
        message: 'Erreur personnalisée',
        status: 403
      };

      // Act
      errorHandler(error, mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erreur interne du serveur',
        message: 'Erreur personnalisée'
      });
    });

    it('devrait gérer les erreurs génériques sans status', () => {
      // Arrange
      const error = {
        message: 'Erreur générique'
      };

      // Act
      errorHandler(error, mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erreur interne du serveur',
        message: 'Erreur générique'
      });
    });

    it('devrait masquer les messages d\'erreur en production', () => {
      // Arrange
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const error = {
        message: 'Message sensible'
      };

      // Act
      errorHandler(error, mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erreur interne du serveur',
        message: 'Une erreur inattendue s\'est produite'
      });

      // Cleanup
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('notFoundHandler', () => {
    it('devrait retourner 404 pour une route non trouvée', () => {
      // Act
      notFoundHandler(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Route non trouvée',
        message: 'La route GET /test n\'existe pas'
      });
    });

    it('devrait gérer différentes méthodes HTTP', () => {
      // Arrange
      mockReq.method = 'POST';
      mockReq.url = '/api/test';

      // Act
      notFoundHandler(mockReq, mockRes);

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Route non trouvée',
        message: 'La route POST /api/test n\'existe pas'
      });
    });
  });

  describe('asyncHandler', () => {
    it('devrait exécuter une fonction async avec succès', async () => {
      // Arrange
      const asyncFn = jest.fn().mockResolvedValue('success');
      const wrappedFn = asyncHandler(asyncFn);

      // Act
      await wrappedFn(mockReq, mockRes, mockNext);

      // Assert
      expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('devrait capturer les erreurs async et les passer à next', async () => {
      // Arrange
      const error = new Error('Async error');
      const asyncFn = jest.fn().mockRejectedValue(error);
      const wrappedFn = asyncHandler(asyncFn);

      // Act
      await wrappedFn(mockReq, mockRes, mockNext);

      // Assert
      expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('devrait gérer les fonctions synchrones qui retournent une promesse', async () => {
      // Arrange
      const syncFn = jest.fn(() => Promise.resolve('sync success'));
      const wrappedFn = asyncHandler(syncFn);

      // Act
      await wrappedFn(mockReq, mockRes, mockNext);

      // Assert
      expect(syncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});