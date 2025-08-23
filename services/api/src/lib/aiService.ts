import axios from 'axios';
import { getTranslationProvider } from './translationProvider';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export async function post(path: string, data: any, config?: any) {
  const provider = getTranslationProvider();
  // If mock provider is in use, emulate AI service for translation-related endpoints
  if ((process.env.TRANSLATION_PROVIDER || 'mock') === 'mock') {
    // Simple emulation for accessibility endpoints: return a harmless mock
    if (path.includes('scene-description')) {
      return { data: { description: 'Mock scene description', objects: [], confidence: 0.99 } };
    }
    if (path.includes('object-detection')) {
      return { data: { objects: [], confidence: 0.9 } };
    }
  }

  // Fallback to proxying to the real AI service
  const resp = await axios.post(`${AI_SERVICE_URL}${path}`, data, config);
  return resp;
}

export async function get(path: string, config?: any) {
  if ((process.env.TRANSLATION_PROVIDER || 'mock') === 'mock') {
    if (path.includes('supported-languages')) {
      const provider = getTranslationProvider();
      if (provider.getSupportedLanguages) {
        const langs = await provider.getSupportedLanguages();
        return { data: { languages: langs } };
      }
      return { data: { languages: [] } };
    }
  }

  const resp = await axios.get(`${AI_SERVICE_URL}${path}`, config);
  return resp;
}
