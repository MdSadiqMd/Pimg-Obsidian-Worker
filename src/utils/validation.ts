import type { UploadFormData, GistRequestParams } from '../types';
import { FILE_CONFIG } from '../constants';

/**
 * Validates and extracts upload form data from a request
 */
export function validateUploadFormData(formData: FormData): {
    isValid: boolean;
    data?: UploadFormData;
    error?: string;
} {
    const imageFile = formData.get('image') as File | null;
    const githubAccessToken = formData.get('githubAccessToken') as string | null;
    const githubUsername = formData.get('githubUsername') as string | null;

    // Validate image file
    if (!imageFile) {
        return {
            isValid: false,
            error: 'Image file is required'
        };
    }

    if (!imageFile.type.startsWith(FILE_CONFIG.IMAGE_MIME_PREFIX)) {
        return {
            isValid: false,
            error: 'Invalid image file type'
        };
    }

    // Validate GitHub credentials
    if (!githubAccessToken || githubAccessToken.trim() === '') {
        return {
            isValid: false,
            error: 'GitHub access token is required'
        };
    }

    if (!githubUsername || githubUsername.trim() === '') {
        return {
            isValid: false,
            error: 'GitHub username is required'
        };
    }

    return {
        isValid: true,
        data: {
            image: imageFile,
            githubAccessToken: githubAccessToken.trim(),
            githubUsername: githubUsername.trim()
        }
    };
}

/**
 * Validates and extracts gist request parameters from URL pathname
 */
export function validateGistRequestParams(pathname: string): {
    isValid: boolean;
    data?: GistRequestParams;
    error?: string;
} {
    const pathParts = pathname.split('/').filter(part => part !== '');

    // Expected format: gist/{gistId}/{filename}
    if (pathParts.length !== 3 || pathParts[0] !== 'gist') {
        return {
            isValid: false,
            error: 'Invalid URL format. Expected: /gist/{gistId}/{filename}'
        };
    }

    const gistId = pathParts[1];
    const filename = pathParts[2];

    if (!gistId || gistId.trim() === '') {
        return {
            isValid: false,
            error: 'Gist ID is required'
        };
    }

    if (!filename || filename.trim() === '') {
        return {
            isValid: false,
            error: 'Filename is required'
        };
    }

    return {
        isValid: true,
        data: {
            gistId: gistId.trim(),
            filename: filename.trim()
        }
    };
}

/**
 * Extracts file extension from filename
 */
export function getFileExtension(filename: string): string {
    const parts = filename.split('.');
    if (parts.length > 1) {
        return parts[parts.length - 1];
    }
    return FILE_CONFIG.DEFAULT_EXTENSION;
}

/**
 * Generates a unique filename with timestamp
 */
export function generateFileName(originalFilename: string): string {
    const timestamp = Date.now();
    const extension = getFileExtension(originalFilename);
    return `${FILE_CONFIG.FILENAME_PREFIX}-${timestamp}.${extension}`;
}
