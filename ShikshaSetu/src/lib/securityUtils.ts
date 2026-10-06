/**
 * ShikshaSetu Security Utilities
 * Defense-in-depth sanitization, input validation, secure file upload verification,
 * and AI prompt guardrails.
 */

// -----------------------------------------------------------------------------
// 1. INPUT SANITIZATION (Anti-XSS & Markup Neutralization)
// -----------------------------------------------------------------------------

/**
 * Strips HTML tags, script elements, iframe injections, javascript: URIs,
 * and dangerous event attributes to prevent Cross-Site Scripting (XSS).
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';

  return (
    input
      // Strip <script>...</script> tags and contents
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Strip <iframe>...</iframe> tags and contents
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      // Strip all remaining HTML tags
      .replace(/<[^>]+>/g, '')
      // Strip javascript: pseudo-protocols
      .replace(/javascript\s*:/gi, '')
      // Strip vbscript: pseudo-protocols
      .replace(/vbscript\s*:/gi, '')
      // Strip data: text/html pseudo-protocols
      .replace(/data\s*:\s*text\/html/gi, '')
      // Strip dangerous inline event handlers (onload, onerror, onclick, etc.)
      .replace(/\bon\w+\s*=/gi, '')
      .trim()
  );
}

// -----------------------------------------------------------------------------
// 2. FORM VALIDATION
// -----------------------------------------------------------------------------

/**
 * Validates email according to RFC 5322 format.
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length > 254) return false;
  // Standard robust email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(trimmed);
}

/**
 * Validates password strength:
 * - Minimum 6 characters (Supabase default)
 * - Maximum 128 characters (prevent DoS)
 * - Prohibits control characters
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required.' };
  }
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long.' };
  }
  if (password.length > 128) {
    return { valid: false, message: 'Password must not exceed 128 characters.' };
  }
  // Check for control characters
  if (/[\x00-\x1F\x7F]/.test(password)) {
    return { valid: false, message: 'Password contains invalid characters.' };
  }
  return { valid: true };
}

// -----------------------------------------------------------------------------
// 3. INSTITUTIONAL VERIFICATION CODE (Prevents Role Escalation on Registration)
// -----------------------------------------------------------------------------

/**
 * Canonical institutional access codes for authorized educator/admin onboarding.
 * Public students do not require an institutional code.
 */
export const VALID_INSTITUTIONAL_CODES = new Set([
  'SHIKSHA-EDU-2026',
  'UDISE-ODISHA-212604',
  'UDISE-WARDHA-270801',
  'DISTRICT-ADMIN-SECRET',
]);

/**
 * Verifies if the provided code grants teacher or school admin onboarding rights.
 */
export function verifyInstitutionalCode(code?: string): boolean {
  if (!code || typeof code !== 'string') return false;
  return VALID_INSTITUTIONAL_CODES.has(code.trim().toUpperCase());
}

// -----------------------------------------------------------------------------
// 4. SECURE FILE UPLOADS (MIME Type & Size Validation)
// -----------------------------------------------------------------------------

export interface FileValidationOptions {
  category?: 'lesson_resource' | 'avatar';
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  maxSizeBytes?: number;
}

// Allowed MIME types for educational worksheets, diagrams, audio capsules, videos, and documents
export const DEFAULT_ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'video/mp4',
  'video/webm',
  'text/plain',
];

export const DEFAULT_ALLOWED_EXTENSIONS = [
  'pdf',
  'jpg',
  'jpeg',
  'png',
  'webp',
  'mp3',
  'wav',
  'ogg',
  'mp4',
  'webm',
  'txt',
];

// Dangerous extensions that must ALWAYS be rejected regardless of MIME type
export const DISALLOWED_EXTENSIONS = new Set([
  'exe',
  'bat',
  'cmd',
  'sh',
  'bin',
  'msi',
  'com',
  'scr',
  'js',
  'mjs',
  'vbs',
  'html',
  'htm',
  'xhtml',
  'svg', // SVG can contain embedded scripts
  'php',
  'py',
  'rb',
  'jar',
  'apk',
]);

export const MAX_RESOURCE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB max for lessons/worksheets
export const MAX_AVATAR_SIZE_BYTES = 3 * 1024 * 1024; // 3 MB max for avatars

export interface FileValidationResult {
  isValid: boolean;
  valid: boolean;
  error?: string;
  sanitizedFileName?: string;
  sanitizedFilename?: string;
}

/**
 * Validates a file before uploading to Supabase Storage:
 * 1. Checks file size against upper limits.
 * 2. Validates extension against strict whitelist and explicit blacklist.
 * 3. Validates MIME type against allowed types.
 * 4. Sanitizes filename against path traversal (../) or malicious characters.
 */
export function validateFileUpload(
  file: { name: string; size: number; type: string },
  options: FileValidationOptions = {}
): FileValidationResult {
  const isAvatar = options.category === 'avatar';
  const maxSizeBytes =
    options.maxSizeBytes || (isAvatar ? MAX_AVATAR_SIZE_BYTES : MAX_RESOURCE_SIZE_BYTES);
  const allowedMimes =
    options.allowedMimeTypes ||
    (isAvatar
      ? ['image/jpeg', 'image/png', 'image/webp']
      : DEFAULT_ALLOWED_MIME_TYPES);
  const allowedExts =
    options.allowedExtensions ||
    (isAvatar ? ['jpg', 'jpeg', 'png', 'webp'] : DEFAULT_ALLOWED_EXTENSIONS);

  if (!file || !file.name) {
    return { isValid: false, valid: false, error: 'No file provided.' };
  }

  // 1. File size check
  if (file.size <= 0) {
    return { isValid: false, valid: false, error: 'File is empty (0 bytes).' };
  }
  if (file.size > maxSizeBytes) {
    const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
    return {
      isValid: false,
      valid: false,
      error: `File size exceeds the allowed limit of ${maxMb}MB.`,
    };
  }

  // 2. Extension check & sanitization
  const rawFileName = file.name.trim();
  // Prevent directory traversal
  const baseName = rawFileName.replace(/^.*[\\/]/, '');
  const extMatch = baseName.match(/\.([a-zA-Z0-9]+)$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : '';

  if (!ext) {
    return { isValid: false, valid: false, error: 'Files must have a valid file extension.' };
  }

  if (DISALLOWED_EXTENSIONS.has(ext)) {
    return {
      isValid: false,
      valid: false,
      error: `File type ".${ext}" is prohibited for security reasons.`,
    };
  }

  if (!allowedExts.includes(ext)) {
    return {
      isValid: false,
      valid: false,
      error: `File extension ".${ext}" is not supported. Allowed formats: ${allowedExts.join(', ')}.`,
    };
  }

  // 3. MIME type check
  if (file.type && !allowedMimes.includes(file.type.toLowerCase())) {
    return {
      isValid: false,
      valid: false,
      error: `MIME type "${file.type}" is not accepted for educational resources.`,
    };
  }

  // 4. Sanitize file name (alphanumeric, dashes, underscores, dots only)
  const sanitizedFileName = baseName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.');

  return {
    isValid: true,
    valid: true,
    sanitizedFileName,
    sanitizedFilename: sanitizedFileName,
  };
}

// -----------------------------------------------------------------------------
// 5. AI REQUEST SECURITY (Prompt Validation & Sanitization)
// -----------------------------------------------------------------------------

export const MAX_AI_MESSAGE_LENGTH = 1000;

export interface AIValidationResult {
  valid: boolean;
  sanitized: string;
  sanitizedMessage: string;
  error?: string;
}

/**
 * Validates and sanitizes prompt input sent to the AI Teacher engine:
 * 1. Checks length limits (prevent DoS/excessive tokens).
 * 2. Strips HTML and script injection vectors.
 * 3. Rejects empty or whitespace-only messages.
 */
export function validateAIRequest(
  message: string,
  maxLength: number = MAX_AI_MESSAGE_LENGTH
): AIValidationResult {
  if (!message || typeof message !== 'string') {
    return { valid: false, sanitized: '', sanitizedMessage: '', error: 'Message cannot be empty.' };
  }

  const trimmed = message.trim();
  if (trimmed.length === 0) {
    return { valid: false, sanitized: '', sanitizedMessage: '', error: 'Message cannot be empty.' };
  }

  if (trimmed.length > maxLength) {
    return {
      valid: false,
      sanitized: '',
      sanitizedMessage: '',
      error: `Message is too long (maximum ${maxLength} characters). Please keep questions focused.`,
    };
  }

  // Sanitize markup
  const sanitized = sanitizeInput(trimmed);

  return {
    valid: true,
    sanitized,
    sanitizedMessage: sanitized,
  };
}
