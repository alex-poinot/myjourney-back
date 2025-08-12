import { vi } from 'vitest';
import UserService from '../userService.js';
import UserDao from '../../dao/userDao.js';

// Mock du DAO
vi.mock('../../dao/userDao.js');

describe('UserService', () => {
  let userService;
  let mockUserDao;

  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    vi.clearAllMocks();
    
    // Créer une instance mockée du DAO
    mockUserDao = {
      getAllUsers: vi.fn(),
      getUserById: vi.fn(),
      createUser: vi.fn(),
      updateUser: vi.fn(),
      deleteUser: vi.fn(),
      checkUserExists: vi.fn(),
      checkEmailExists: vi.fn()
    };
    
    // Mock du constructeur UserDao
    UserDao.mockImplementation(() => mockUserDao);
    
    userService = new UserService();
  });

  describe('getAllUsers', () => {
    it('devrait retourner tous les utilisateurs avec succès', async () => {
      // Arrange
      const mockUsers = [
        { USR_ID: 1, USR_NOM: 'Dupont', USR_MAIL: 'dupont@test.com' },
        { USR_ID: 2, USR_NOM: 'Martin', USR_MAIL: 'martin@test.com' }
      ];
      mockUserDao.getAllUsers.mockResolvedValue(mockUsers);

      // Act
      const result = await userService.getAllUsers();

      // Assert
      expect(result).toEqual({
        success: true,
        data: mockUsers,
        count: 2
      });
      expect(mockUserDao.getAllUsers).toHaveBeenCalledTimes(1);
    });

    it('devrait gérer les erreurs du DAO', async () => {
      // Arrange
      const mockError = new Error('Erreur base de données');
      mockUserDao.getAllUsers.mockRejectedValue(mockError);

      // Act & Assert
      await expect(userService.getAllUsers()).rejects.toEqual({
        status: 500,
        message: 'Erreur lors de la récupération des utilisateurs'
      });
    });

    it('devrait retourner un tableau vide si aucun utilisateur', async () => {
      // Arrange
      mockUserDao.getAllUsers.mockResolvedValue([]);

      // Act
      const result = await userService.getAllUsers();

      // Assert
      expect(result).toEqual({
        success: true,
        data: [],
        count: 0
      });
    });
  });

  // Tests pour les méthodes commentées dans le service
  describe('getUserById (méthode commentée)', () => {
    it('devrait être implémentée dans le futur', () => {
      // Cette méthode est commentée dans le service
      expect(userService.getUserById).toBeUndefined();
    });
  });

  describe('createUser (méthode commentée)', () => {
    it('devrait être implémentée dans le futur', () => {
      // Cette méthode est commentée dans le service
      expect(userService.createUser).toBeUndefined();
    });
  });

  describe('updateUser (méthode commentée)', () => {
    it('devrait être implémentée dans le futur', () => {
      // Cette méthode est commentée dans le service
      expect(userService.updateUser).toBeUndefined();
    });
  });

  describe('deleteUser (méthode commentée)', () => {
    it('devrait être implémentée dans le futur', () => {
      // Cette méthode est commentée dans le service
      expect(userService.deleteUser).toBeUndefined();
    });
  });

  describe('validateUserData (méthode commentée)', () => {
    it('devrait être implémentée dans le futur', () => {
      // Cette méthode est commentée dans le service
      expect(userService.validateUserData).toBeUndefined();
    });
  });
});