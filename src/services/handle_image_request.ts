import type { GistData, ImageData } from '../types';
import { GITHUB_API_BASE_URL, USER_AGENT, ERROR_MESSAGES, CACHE_CONTROL } from '../constants';
import { validateGistRequestParams } from '../utils/validation';
import { createErrorResponse, createBinaryResponse } from '../utils/response';

/**
 * Fetches and serves an image from a GitHub Gist
 */
async function handleImageRequest(request: Request): Promise<Response> {
    try {
        const url = new URL(request.url);
        const validation = validateGistRequestParams(url.pathname);

        if (!validation.isValid || !validation.data) {
            return createErrorResponse(
                validation.error || ERROR_MESSAGES.INVALID_URL_FORMAT,
                400
            );
        }

        const { gistId, filename } = validation.data;

        // Fetch gist from GitHub
        const gistResponse = await fetch(`${GITHUB_API_BASE_URL}/gists/${gistId}`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': USER_AGENT
            }
        });

        if (!gistResponse.ok) {
            return createErrorResponse(ERROR_MESSAGES.GIST_NOT_FOUND, 404);
        }

        const gistData = await gistResponse.json() as GistData;
        const fileData = gistData.files[filename];

        if (!fileData) {
            return createErrorResponse(ERROR_MESSAGES.FILE_NOT_FOUND, 404);
        }

        // Parse image data from gist content
        const imageData = JSON.parse(fileData.content) as ImageData;
        const base64Data = imageData.data;
        const mimeType = imageData.mimeType || 'image/png';

        // Decode base64 to binary
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        return createBinaryResponse(bytes, mimeType, {
            'Cache-Control': CACHE_CONTROL.IMAGE_SERVE
        });
    } catch (error) {
        console.error('Error serving image:', error);
        const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.ERROR_SERVING_IMAGE;
        return createErrorResponse(errorMessage, 500);
    }
}

export default handleImageRequest;
