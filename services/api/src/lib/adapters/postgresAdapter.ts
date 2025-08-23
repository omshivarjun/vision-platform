// Postgres adapter skeleton using Prisma. Requires running `npm install @prisma/client prisma` and `prisma generate`.
let prisma: any = null;

export function initPrismaClient() {
  if (prisma) return prisma;
  try {
    // Lazy import so app doesn't crash when deps aren't installed yet
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
    return prisma;
  } catch (err) {
    // Prisma not installed — return null and caller should handle gracefully
    return null;
  }
}

export async function saveTranslationToPostgres(data: any) {
  const client = initPrismaClient();
  if (!client) return null;
  try {
    const rec = await client.translation.create({ data: {
      userId: data.userId,
      sourceText: data.sourceText,
      translatedText: data.translatedText,
      sourceLanguage: data.sourceLanguage,
      targetLanguage: data.targetLanguage,
      model: data.model,
      confidence: data.confidence,
      processingTime: data.processingTime,
      quality: data.quality,
      context: data.context
    }});
    return rec;
  } catch (err) {
    return null;
  }
}
