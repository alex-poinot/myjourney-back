import { vi } from 'vitest';

// Mock global pour le logger
vi.mock('./src/utils/logger.js', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
  }
}));