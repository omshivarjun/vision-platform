import axios from 'axios';
import { TranslationProvider, TranslationResult } from '../translationProvider';

export class OpenAIProvider implements TranslationProvider {
  async translate(text: string, target: string, options?: any): Promise<TranslationResult> {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('OPENAI_API_KEY not set');

    // Placeholder: this is a simple example calling OpenAI REST API v1/completions or chat completions.
    // Replace with the actual request shape and model you want to use.
    const resp = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a translation assistant.' },
        { role: 'user', content: `Translate to ${target}: ${text}` }
      ]
    }, {
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json'
      }
    });

    const translatedText = resp.data?.choices?.[0]?.message?.content || resp.data?.choices?.[0]?.text || '';

    return {
      translatedText,
      sourceLang: options?.sourceLanguage || 'auto',
      targetLang: target,
      modelUsed: resp.data?.model || 'openai',
      confidence: 0.9
    };
  }

  async translateBatch(texts: string[], target: string, options?: any) {
    return Promise.all(texts.map(t => this.translate(t, target, options)));
  }

  async detectLanguage(text: string) {
    // Fallback simple detection via OpenAI prompt
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('OPENAI_API_KEY not set');
    const resp = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a language detection assistant.' },
        { role: 'user', content: `Detect language of: ${text}` }
      ]
    }, {
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }
    });

    const detected = resp.data?.choices?.[0]?.message?.content || '';
    return { detectedLanguage: detected.trim().split('\n')[0] || 'unknown', confidence: 0.7 };
  }

  async getSupportedLanguages() {
    // OpenAI doesn't provide a languages list endpoint; return common languages as a reasonable default
    return [
      { code: 'en', name: 'English', native_name: 'English' },
      { code: 'es', name: 'Spanish', native_name: 'Español' },
      { code: 'fr', name: 'French', native_name: 'Français' },
      { code: 'de', name: 'German', native_name: 'Deutsch' }
    ];
  }
}
