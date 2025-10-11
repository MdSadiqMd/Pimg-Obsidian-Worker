/**
 * Pimg Worker - Cloudflare Worker for image hosting via GitHub Gists
 * Main entry point for handling HTTP requests
 */

import type { Env } from './types';
import { HTTP_METHODS, ROUTES, ERROR_MESSAGES, SUCCESS_MESSAGES, CACHE_CONTROL } from './constants';
import { handleCORS } from './utils/cors_configuration';
import { createTextResponse, createErrorResponse } from './utils/response';
import handleImageUpload from './services/handle_image_upload';
import handleImageRequest from './services/handle_image_request';

/**
 * Main fetch handler for the Cloudflare Worker
 */
export default {
    async fetch(
        request: Request,
        env: Env,
        ctx: ExecutionContext
    ): Promise<Response> {
        const { method, url } = request;
        const { pathname } = new URL(url);

        // Handle CORS preflight requests
        if (method === HTTP_METHODS.OPTIONS) {
            return handleCORS();
        }

        // Handle GET requests
        if (method === HTTP_METHODS.GET) {
            // Serve images from gist
            if (pathname.startsWith(ROUTES.GIST_PREFIX)) {
                return await handleImageRequest(request);
            }

            // Health check endpoint
            return createTextResponse(
                SUCCESS_MESSAGES.HEALTH_CHECK,
                200,
                { 'Cache-Control': CACHE_CONTROL.HEALTH_CHECK }
            );
        }

        // Handle POST requests (image uploads)
        if (method === HTTP_METHODS.POST) {
            return await handleImageUpload(request, env);
        }

        // Method not allowed
        return createErrorResponse(ERROR_MESSAGES.METHOD_NOT_ALLOWED, 405);
    }
};
