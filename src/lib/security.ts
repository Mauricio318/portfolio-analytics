import path from 'path';

// Extensions allowed for upload
const ALLOWED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.pdf']);

/**
 * Sanitizes input strings against XSS, Script Injection, and HTML Manipulation
 */
export function sanitizeInput(input: any): any {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove <script> tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove <iframe> tags
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove <object> tags
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '') // Remove <embed> tags
    .replace(/on\w+\s*=\s*(['"]).*?\1/gi, '') // Remove inline handlers (e.g. onload="", onerror="")
    .replace(/javascript\s*:/gi, '') // Remove javascript: protocol
    .replace(/data\s*:\s*text\/html/gi, '') // Remove data:text/html
    .trim();
}

/**
 * Recursively sanitizes all string properties inside an object
 */
export function sanitizeObject<T>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as unknown as T;
  }
  
  const sanitized: any = {};
  for (const key of Object.keys(obj)) {
    const val = (obj as any)[key];
    if (typeof val === 'string') {
      sanitized[key] = sanitizeInput(val);
    } else if (typeof val === 'object' && val !== null) {
      sanitized[key] = sanitizeObject(val);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

/**
 * Validates if the file extension is allowed for upload
 */
export function isAllowedFileExtension(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.has(ext);
}

/**
 * Validates if a file path stays strictly inside the public/uploads directory (Path Traversal Protection)
 */
export function isSafeUploadPath(filePath: string): boolean {
  if (!filePath || typeof filePath !== 'string') return false;
  if (filePath.includes('..') || filePath.includes('\0')) return false;

  const normalized = path.normalize(filePath).replace(/\\/g, '/');
  if (!normalized.startsWith('/uploads/') && !normalized.startsWith('public/uploads/')) {
    return false;
  }

  const baseUploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
  const targetPath = path.resolve(process.cwd(), 'public', normalized.replace(/^\//, ''));

  return targetPath.startsWith(baseUploadsDir);
}
