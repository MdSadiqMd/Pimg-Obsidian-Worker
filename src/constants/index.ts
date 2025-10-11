// API Configuration
export const GITHUB_API_BASE_URL = 'https://api.github.com';
export const USER_AGENT = 'Pimg-Worker';

// Cache Configuration
export const CACHE_CONTROL = {
    HEALTH_CHECK: 'max-age=31536000',
    IMAGE_SERVE: 'public, max-age=86400', // 24 hours
    CORS_PREFLIGHT: '86400' // 24 hours
} as const;

// HTTP Methods
export const HTTP_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    OPTIONS: 'OPTIONS'
} as const;

// Route Patterns
export const ROUTES = {
    GIST_PREFIX: '/gist/',
    HEALTH_CHECK: '/'
} as const;

// Error Messages
export const ERROR_MESSAGES = {
    INVALID_IMAGE: 'Invalid image file',
    MISSING_CREDENTIALS: 'Missing GitHub credentials',
    GIST_NOT_FOUND: 'Gist not found',
    FILE_NOT_FOUND: 'File not found in gist',
    INVALID_URL_FORMAT: 'Invalid URL format',
    METHOD_NOT_ALLOWED: 'Method not allowed',
    INTERNAL_SERVER_ERROR: 'Internal server error',
    ERROR_SERVING_IMAGE: 'Error serving image'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
    HEALTH_CHECK: 'Pimg Gist Worker is Healthy'
} as const;

// File Configuration
export const FILE_CONFIG = {
    DEFAULT_EXTENSION: 'png',
    FILENAME_PREFIX: 'obsidian-upload',
    IMAGE_MIME_PREFIX: 'image/'
} as const;

// Gist Configuration
export const GIST_CONFIG = {
    IS_PUBLIC: false, // Secret gist by default
    DESCRIPTION_PREFIX: 'Image uploaded by Pimg'
} as const;
