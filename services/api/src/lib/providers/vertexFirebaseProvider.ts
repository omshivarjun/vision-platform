import type { TranslationProvider, TranslationResult } from '../translationProvider';
import { GoogleAuth } from 'google-auth-library';
import axios from 'axios';

/**
 * Vertex/Firebase AI translation provider
 * Uses Vertex Text model via REST (text-bison or similar) to perform simple translation prompts
 */
export class VertexFirebaseProvider implements TranslationProvider {
  private projectId: string;
  private location: string;
  private model: string;

  constructor() {
    this.projectId = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || '';
    this.location = process.env.VERTEX_LOCATION || 'us-central1';
    this.model = process.env.VERTEX_TEXT_MODEL || 'text-bison@001';
  }

  private async getAccessToken() {
    const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
    const client = await auth.getClient();
    return await client.getAccessToken();
  }

  private promptFor(text: string, target: string, source?: string) {
    const src = source ? ` from ${source}` : '';
    return `Translate the following text${src} to ${target}. Return only the translated text without quotes.\nText: ${text}`;
  }

  async translate(text: string, target: string, options?: any): Promise<TranslationResult> {
    const sourceLanguage = options?.sourceLanguage;
    const token = await this.getAccessToken();
    const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${this.model}:predict`;

    const instances = [{ content: this.promptFor(text, target, sourceLanguage) }];
    const params = { temperature: 0.2, maxOutputTokens: 512 };

    const { data } = await axios.post(endpoint, { instances, parameters: params }, {
      headers: {
        Authorization: `Bearer ${token.token || token}`,
        'Content-Type': 'application/json'
      }
    });

    const prediction = data?.predictions?.[0]?.content || data?.predictions?.[0]?.candidates?.[0]?.content || '';
    return {
      translatedText: String(prediction).trim(),
      sourceLang: sourceLanguage || 'auto',
      targetLang: target,
      modelUsed: this.model,
      confidence: 0.9,
    };
  }

  async detectLanguage(text: string): Promise<{ detectedLanguage: string; confidence: number; }> {
    // Simple heuristic fallback; for real detection consider Vertex "textembedding-gecko" + classifier or Cloud Translate detectLanguage
    const sample = text.slice(0, 100).toLowerCase();
    const looksEnglish = /[a-z]/.test(sample);
    return { detectedLanguage: looksEnglish ? 'en' : 'auto', confidence: 0.6 };
  }

  async getSupportedLanguages(): Promise<{ code: string; name: string; native_name?: string; }[]> {
    // Delegate to translation.ts fallback list or implement via Cloud Translate list API; keep minimal for now
    return [
      { code: 'en', name: 'English', native_name: 'English' },
      { code: 'es', name: 'Spanish', native_name: 'Español' },
      { code: 'fr', name: 'French', native_name: 'Français' },
      { code: 'de', name: 'German', native_name: 'Deutsch' },
      { code: 'hi', name: 'Hindi', native_name: 'हिन्दी' }
    ];
  }
}
