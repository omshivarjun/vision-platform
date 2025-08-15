import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

interface MediaProcessingOptions {
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  denoise?: boolean;
  normalize?: boolean;
  generateCaptions?: boolean;
  extractAudio?: boolean;
  quality?: 'low' | 'medium' | 'high';
}

interface ProcessedMedia {
  originalFile: File;
  processedUrl?: string;
  audioUrl?: string;
  captions?: string;
  metadata: {
    duration?: number;
    dimensions?: { width: number; height: number };
    fileSize: number;
    format: string;
  };
}

export function useMediaProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedMedia, setProcessedMedia] = useState<ProcessedMedia | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processMedia = useCallback(async (
    file: File, 
    options: MediaProcessingOptions = {}
  ): Promise<ProcessedMedia | null> => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      // Validate file
      if (!file.type.startsWith('video/') && !file.type.startsWith('audio/')) {
        throw new Error('File must be a video or audio file');
      }

      const formData = new FormData();
      formData.append('media', file);
      formData.append('options', JSON.stringify(options));

      // Simulate processing steps
      const steps = [
        'Uploading file...',
        'Analyzing media...',
        'Processing video...',
        'Extracting audio...',
        'Generating captions...',
        'Finalizing...'
      ];

      for (let i = 0; i < steps.length; i++) {
        setProgress((i + 1) / steps.length * 100);
        toast.loading(steps[i], { id: 'media-processing' });
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Call backend API for actual processing
      const response = await fetch('/api/media/process', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Media processing failed on server');
      }

      const result = await response.json();
      
      // Create processed media object
      const processed: ProcessedMedia = {
        originalFile: file,
        processedUrl: result.processedUrl,
        audioUrl: result.audioUrl,
        captions: result.captions,
        metadata: {
          duration: result.metadata?.duration,
          dimensions: result.metadata?.dimensions,
          fileSize: file.size,
          format: file.type,
        },
      };

      setProcessedMedia(processed);
      toast.success('Media processing completed!', { id: 'media-processing' });
      
      return processed;
    } catch (err: any) {
      const errorMessage = err.message || 'Media processing failed';
      setError(errorMessage);
      toast.error(errorMessage, { id: 'media-processing' });
      console.error('Media processing error:', err);
      return null;
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, []);

  const cropVideo = useCallback(async (
    file: File,
    cropArea: { x: number; y: number; width: number; height: number }
  ) => {
    return processMedia(file, { crop: cropArea });
  }, [processMedia]);

  const denoiseAudio = useCallback(async (file: File) => {
    return processMedia(file, { denoise: true });
  }, [processMedia]);

  const normalizeAudio = useCallback(async (file: File) => {
    return processMedia(file, { normalize: true });
  }, [processMedia]);

  const generateCaptions = useCallback(async (file: File) => {
    return processMedia(file, { generateCaptions: true });
  }, [processMedia]);

  const extractAudio = useCallback(async (file: File) => {
    return processMedia(file, { extractAudio: true });
  }, [processMedia]);

  const clearProcessedMedia = useCallback(() => {
    setProcessedMedia(null);
    setError(null);
    setProgress(0);
  }, []);

  return {
    processMedia,
    cropVideo,
    denoiseAudio,
    normalizeAudio,
    generateCaptions,
    extractAudio,
    isProcessing,
    progress,
    processedMedia,
    error,
    clearProcessedMedia,
  };
}