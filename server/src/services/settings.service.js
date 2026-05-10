import prisma from '../utils/prisma.js';

const VALID_THEMES = ['light', 'dark'];
const VALID_LANGUAGES = ['en', 'hi'];

// ─── Get Settings ─────────────────────────────────────────────────────────────
export async function getSettings(associateId) {
  const associate = await prisma.associate.findUnique({
    where: { id: associateId },
    select: { theme: true, language: true },
  });

  if (!associate) {
    throw Object.assign(new Error('Associate not found'), { statusCode: 404 });
  }

  return { theme: associate.theme, language: associate.language };
}

// ─── Update Settings ──────────────────────────────────────────────────────────
export async function updateSettings(associateId, data) {
  const updateData = {};

  if (data.theme !== undefined) {
    if (!VALID_THEMES.includes(data.theme)) {
      throw Object.assign(
        new Error(`Invalid theme. Must be one of: ${VALID_THEMES.join(', ')}`),
        { statusCode: 400 },
      );
    }
    updateData.theme = data.theme;
  }

  if (data.language !== undefined) {
    if (!VALID_LANGUAGES.includes(data.language)) {
      throw Object.assign(
        new Error(`Invalid language. Must be one of: ${VALID_LANGUAGES.join(', ')}`),
        { statusCode: 400 },
      );
    }
    updateData.language = data.language;
  }

  if (Object.keys(updateData).length === 0) {
    throw Object.assign(new Error('No valid settings to update'), { statusCode: 400 });
  }

  const updated = await prisma.associate.update({
    where: { id: associateId },
    data: updateData,
    select: { theme: true, language: true },
  });

  return updated;
}
