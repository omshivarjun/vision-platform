import { getTranslationProvider } from '../src/lib/translationProvider';

test('mock provider returns mock translation', async () => {
  process.env.TRANSLATION_PROVIDER = 'mock';
  const provider = getTranslationProvider();
  const result = await provider.translate('Hello world', 'es');
  expect(result.translatedText).toMatch(/\[MOCK es\] Hello world/);
  expect(result.targetLang).toBe('es');
});
