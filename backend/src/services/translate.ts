/**
 * Translation adapter (provider-agnostic)
 * Purpose: Provide a single entrypoint to translate text using available providers or a safe stub.
 * Next steps: Wire Google/Azure providers using keys from environment variables; add caching.
 */

export interface TranslateParams {
  text: string;
  targetLang: string;
  sourceLang?: string;
}

export interface TranslateResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
  provider: 'stub' | 'google' | 'azure';
}

async function translateWithStub({ text, targetLang, sourceLang = 'auto' }: TranslateParams): Promise<TranslateResult> {
  return {
    translatedText: `[${targetLang}] ${text}`,
    sourceLanguage: sourceLang,
    targetLanguage: targetLang,
    confidence: 0.9,
    provider: 'stub',
  };
}

export async function translateText(params: TranslateParams): Promise<TranslateResult> {
  // TODO: Implement provider selection and calls when keys are present
  // if (process.env.GOOGLE_TRANSLATE_API_KEY) return translateWithGoogle(params)
  // if (process.env.AZURE_TRANSLATOR_KEY) return translateWithAzure(params)
  return translateWithStub(params);
}
