import { 
  API_CONSTANTS, 
  SUPPORTED_LANGUAGES, 
  SUPPORTED_FILE_TYPES 
} from '../utils';

describe('Shared Package - Utils', () => {
  describe('constants', () => {
    it('should export API_CONSTANTS', () => {
      expect(API_CONSTANTS).toBeDefined();
      expect(API_CONSTANTS.VERSION).toBe('v1');
      expect(API_CONSTANTS.BASE_URL).toBeDefined();
    });

    it('should export SUPPORTED_LANGUAGES', () => {
      expect(SUPPORTED_LANGUAGES).toBeDefined();
      expect(SUPPORTED_LANGUAGES.en).toBeDefined();
      expect(SUPPORTED_LANGUAGES.es).toBeDefined();
    });

    it('should export SUPPORTED_FILE_TYPES', () => {
      expect(SUPPORTED_FILE_TYPES).toBeDefined();
      expect(SUPPORTED_FILE_TYPES.IMAGE).toBeDefined();
      expect(SUPPORTED_FILE_TYPES.AUDIO).toBeDefined();
    });
  });
});
