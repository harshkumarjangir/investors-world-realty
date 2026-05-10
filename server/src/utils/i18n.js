import en from '../locales/en.js';
import hi from '../locales/hi.js';

const locales = { en, hi };
const DEFAULT_LANG = 'en';
const SUPPORTED_LANGS = ['en', 'hi'];

/**
 * Get a translated message by key.
 * Supports interpolation: t('wallet.transfer.sent', 'en', { amount: 500, recipient: 'IW100002' })
 *
 * @param {string} key - Dot-notation message key
 * @param {string} [lang='en'] - Language code
 * @param {object} [params={}] - Interpolation values
 * @returns {string}
 */
export function t(key, lang = DEFAULT_LANG, params = {}) {
  const language = SUPPORTED_LANGS.includes(lang) ? lang : DEFAULT_LANG;
  let message = locales[language]?.[key] || locales[DEFAULT_LANG]?.[key] || key;

  // Interpolate {param} placeholders
  for (const [k, v] of Object.entries(params)) {
    message = message.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  }

  return message;
}

/**
 * Parse Accept-Language header and return best matching language.
 * @param {string|undefined} header - Accept-Language header value
 * @returns {string} Language code ('en' or 'hi')
 */
export function parseAcceptLanguage(header) {
  if (!header) return DEFAULT_LANG;

  const languages = header
    .split(',')
    .map((part) => {
      const [lang, q] = part.trim().split(';q=');
      return { lang: lang.trim().split('-')[0].toLowerCase(), q: q ? parseFloat(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { lang } of languages) {
    if (SUPPORTED_LANGS.includes(lang)) return lang;
  }

  return DEFAULT_LANG;
}

/**
 * Determine language for a request.
 * Priority: 1) associate's saved preference, 2) Accept-Language header, 3) default 'en'
 *
 * @param {object} req - Express request
 * @returns {string}
 */
export function getRequestLanguage(req) {
  // Authenticated associate — use saved preference
  if (req.associate?.language) {
    return SUPPORTED_LANGS.includes(req.associate.language) ? req.associate.language : DEFAULT_LANG;
  }

  // Unauthenticated — parse Accept-Language header
  return parseAcceptLanguage(req.headers['accept-language']);
}

export { SUPPORTED_LANGS, DEFAULT_LANG };
