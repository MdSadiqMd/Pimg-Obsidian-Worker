import type { Env, UploadResponse } from '../types';
import { ERROR_MESSAGES } from '../constants';
import { validateUploadFormData, generateFileName } from '../utils/validation';
import { createJsonResponse, createErrorResponse } from '../utils/response';
import arrayBufferToBase64 from '../utils/array_buffer_to_base64';
import createGitHubGist from './create_github_gist';

/**
 * Handles image upload requests
 */
async function handleImageUpload(request: Request, env: Env): Promise<Response> {
    try {
        const formData = await request.formData();
        const validation = validateUploadFormData(formData);

        if (!validation.isValid || !validation.data) {
            return createErrorResponse(
                validation.error || ERROR_MESSAGES.INVALID_IMAGE,
                400
            );
        }

        const { image, githubAccessToken, githubUsername } = validation.data;

        // Convert image to base64
        const arrayBuffer = await image.arrayBuffer();
        const base64Image = arrayBufferToBase64(arrayBuffer);

        // Generate unique filename
        const fileName = generateFileName(image.name);

        // Create gist with the image
        const gistResult = await createGitHubGist(
            githubAccessToken,
            fileName,
            base64Image,
            image.type
        );

        if (!gistResult.success || !gistResult.gistId) {
            return createErrorResponse(
                `Gist creation failed: ${gistResult.error}`,
                500
            );
        }

        // Build proxy URL for the image
        const url = new URL(request.url);
        const imageUrl = `${url.origin}/gist/${gistResult.gistId}/${fileName}`;

        const responseData: UploadResponse = {
            success: true,
            imageUrl,
            fileName,
            gistId: gistResult.gistId
        };

        return createJsonResponse(responseData, 200);
    } catch (error) {
        console.error('Error handling image upload:', error);
        const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
        return createErrorResponse(errorMessage, 500);
    }
}

export default handleImageUpload;
