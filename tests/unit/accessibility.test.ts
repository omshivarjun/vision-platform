import { AccessibilityService } from '../../services/ai/services/accessibility_service';

describe('Accessibility Service', () => {
  let accessibilityService: AccessibilityService;

  beforeEach(() => {
    accessibilityService = new AccessibilityService();
  });

  describe('Scene Description', () => {
    test('should generate scene description', async () => {
      const mockImageData = Buffer.from('fake-scene-image');
      
      const result = await accessibilityService.describe_scene(mockImageData, 'medium');

      expect(result.description).toBeTruthy();
      expect(result.description.length).toBeGreaterThan(10);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.objects_detected).toBeInstanceOf(Array);
    });

    test('should handle different detail levels', async () => {
      const mockImageData = Buffer.from('fake-scene-image');
      
      const lowDetail = await accessibilityService.describe_scene(mockImageData, 'low');
      const highDetail = await accessibilityService.describe_scene(mockImageData, 'high');

      expect(lowDetail.description.length).toBeLessThan(highDetail.description.length);
      expect(lowDetail.detail_level).toBe('low');
      expect(highDetail.detail_level).toBe('high');
    });
  });

  describe('Object Detection', () => {
    test('should detect objects in image', async () => {
      const mockImageData = Buffer.from('fake-objects-image');
      
      const result = await accessibilityService.detect_objects(mockImageData, 0.5);

      expect(result.objects).toBeInstanceOf(Array);
      expect(result.total_objects).toBeGreaterThanOrEqual(0);
      expect(result.confidence_threshold).toBe(0.5);
    });

    test('should filter by confidence threshold', async () => {
      const mockImageData = Buffer.from('fake-objects-image');
      
      const lowThreshold = await accessibilityService.detect_objects(mockImageData, 0.3);
      const highThreshold = await accessibilityService.detect_objects(mockImageData, 0.8);

      expect(lowThreshold.total_objects).toBeGreaterThanOrEqual(highThreshold.total_objects);
    });

    test('should provide object details', async () => {
      const mockImageData = Buffer.from('fake-objects-image');
      
      const result = await accessibilityService.detect_objects(mockImageData, 0.5);

      result.objects.forEach(obj => {
        expect(obj.name).toBeTruthy();
        expect(obj.confidence).toBeGreaterThan(0);
        expect(obj.bbox).toBeInstanceOf(Array);
        expect(obj.bbox).toHaveLength(4);
      });
    });
  });

  describe('Navigation Assistance', () => {
    test('should provide navigation instructions', async () => {
      const currentLocation = { latitude: 40.7128, longitude: -74.0060 };
      const destination = 'Coffee Shop';
      
      const result = await accessibilityService.get_navigation(
        currentLocation,
        destination,
        'walking'
      );

      expect(result.route).toBeInstanceOf(Array);
      expect(result.total_distance).toBeTruthy();
      expect(result.estimated_time).toBeTruthy();
      expect(result.accessibility_mode).toBe('walking');
    });

    test('should handle different accessibility modes', async () => {
      const currentLocation = { latitude: 40.7128, longitude: -74.0060 };
      const destination = 'Library';
      
      const walkingRoute = await accessibilityService.get_navigation(
        currentLocation,
        destination,
        'walking'
      );
      
      const wheelchairRoute = await accessibilityService.get_navigation(
        currentLocation,
        destination,
        'wheelchair'
      );

      expect(walkingRoute.accessibility_mode).toBe('walking');
      expect(wheelchairRoute.accessibility_mode).toBe('wheelchair');
      expect(wheelchairRoute.safe_paths).toBeInstanceOf(Array);
    });

    test('should identify hazards and safe paths', async () => {
      const currentLocation = { latitude: 40.7128, longitude: -74.0060 };
      const destination = 'Park';
      
      const result = await accessibilityService.get_navigation(
        currentLocation,
        destination,
        'visual'
      );

      expect(result.hazards).toBeInstanceOf(Array);
      expect(result.safe_paths).toBeInstanceOf(Array);
    });
  });

  describe('Voice Guidance', () => {
    test('should generate voice instructions', async () => {
      const instruction = 'Turn right in 50 meters';
      
      const result = await accessibilityService.generate_voice_instruction(
        instruction,
        'medium'
      );

      expect(result.text).toBeTruthy();
      expect(result.verbosity).toBe('medium');
      expect(result.estimated_duration).toBeGreaterThan(0);
    });

    test('should handle different verbosity levels', async () => {
      const instruction = 'Cross the street';
      
      const lowVerbosity = await accessibilityService.generate_voice_instruction(
        instruction,
        'low'
      );
      
      const highVerbosity = await accessibilityService.generate_voice_instruction(
        instruction,
        'high'
      );

      expect(lowVerbosity.text.length).toBeLessThan(highVerbosity.text.length);
    });
  });

  describe('Safety Features', () => {
    test('should detect obstacles', async () => {
      const mockImageData = Buffer.from('fake-obstacle-image');
      
      const result = await accessibilityService.detect_obstacles(mockImageData);

      expect(result.obstacles).toBeInstanceOf(Array);
      result.obstacles.forEach(obstacle => {
        expect(obstacle.type).toBeTruthy();
        expect(obstacle.distance).toBeGreaterThan(0);
        expect(obstacle.severity).toMatch(/^(low|medium|high)$/);
      });
    });

    test('should provide safety warnings', async () => {
      const obstacles = [
        { type: 'stairs', distance: 0.5, severity: 'high' },
        { type: 'pole', distance: 2.0, severity: 'medium' }
      ];
      
      const warnings = await accessibilityService.generate_safety_warnings(obstacles);

      expect(warnings).toBeInstanceOf(Array);
      expect(warnings.length).toBeGreaterThan(0);
      warnings.forEach(warning => {
        expect(warning.message).toBeTruthy();
        expect(warning.priority).toMatch(/^(low|medium|high)$/);
      });
    });
  });
});