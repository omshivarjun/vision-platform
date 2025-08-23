export interface TranslationResult {
  translatedText: string;
  sourceLang?: string;
  targetLang?: string;
  modelUsed?: string;
  confidence?: number;
}

export interface TranslationProvider {
  translate(text: string, target: string, options?: any): Promise<TranslationResult>;
  translateBatch?(texts: string[], target: string, options?: any): Promise<TranslationResult[]>;
  detectLanguage?(text: string): Promise<{ detectedLanguage: string; confidence: number }>;
  getSupportedLanguages?(): Promise<{ code: string; name: string; native_name?: string }[]>;
}

class MockProvider implements TranslationProvider {
  async translate(text: string, target: string, options?: any) {
    return {
      translatedText: `[MOCK ${target}] ${text}`,
      sourceLang: 'auto',
      targetLang: target,
      modelUsed: 'mock-model',
      confidence: 0.99
    };
  }

  async translateBatch(texts: string[], target: string, options?: any) {
    return texts.map(t => ({ translatedText: `[MOCK ${target}] ${t}`, sourceLang: 'auto', targetLang: target, modelUsed: 'mock-model', confidence: 0.99 }));
  }

  async detectLanguage(text: string) {
    // very naive mock
    return { detectedLanguage: 'en', confidence: 0.99 };
  }

  async getSupportedLanguages() {
    return [
      { code: 'en', name: 'English', native_name: 'English' },
      { code: 'es', name: 'Spanish', native_name: 'Español' },
      { code: 'fr', name: 'French', native_name: 'Français' }
    ];
  }
}

import { OpenAIProvider } from './providers/openaiProvider';
import { VertexFirebaseProvider } from './providers/vertexFirebaseProvider';

// Simple factory
export function getTranslationProvider(): TranslationProvider {
  const provider = process.env.TRANSLATION_PROVIDER || 'mock';
  if (provider === 'mock') return new MockProvider();
  if (provider === 'openai') return new OpenAIProvider();
  if (provider === 'firebaseai' || provider === 'vertex') return new VertexFirebaseProvider();
  // Future: add 'google','azure' providers here
  return new MockProvider();
}
