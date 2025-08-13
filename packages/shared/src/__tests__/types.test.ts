import { validateRequest, safeParse } from '../index';

describe('Shared Package - Types', () => {
  describe('validateRequest', () => {
    it('should validate data against schema', () => {
      const mockSchema = {
        parse: jest.fn().mockReturnValue({ name: 'test', age: 25 })
      };
      
      const result = validateRequest(mockSchema, { name: 'test', age: 25 });
      
      expect(mockSchema.parse).toHaveBeenCalledWith({ name: 'test', age: 25 });
      expect(result).toEqual({ name: 'test', age: 25 });
    });
  });

  describe('safeParse', () => {
    it('should safely parse data', () => {
      const mockSchema = {
        safeParse: jest.fn().mockReturnValue({ success: true, data: { name: 'test' } })
      };
      
      const result = safeParse(mockSchema, { name: 'test' });
      
      expect(mockSchema.safeParse).toHaveBeenCalledWith({ name: 'test' });
      expect(result).toEqual({ success: true, data: { name: 'test' } });
    });
  });
});
