import { getCORSHeaders } from './cors_configuration';

/**
 * Creates a JSON response with proper headers
 */
export function createJsonResponse(
    data: unknown,
    status: number = 200
): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...getCORSHeaders()
        }
    });
}

/**
 * Creates an error response with consistent formatting
 */
export function createErrorResponse(
    message: string,
    status: number = 500
): Response {
    return new Response(message, {
        status,
        headers: getCORSHeaders()
    });
}

/**
 * Creates a success text response
 */
export function createTextResponse(
    text: string,
    status: number = 200,
    additionalHeaders: Record<string, string> = {}
): Response {
    return new Response(text, {
        status,
        headers: {
            ...getCORSHeaders(),
            ...additionalHeaders
        }
    });
}

/**
 * Creates a binary response (for images, files, etc.)
 */
export function createBinaryResponse(
    data: Uint8Array | ArrayBuffer,
    contentType: string,
    additionalHeaders: Record<string, string> = {}
): Response {
    return new Response(data, {
        headers: {
            'Content-Type': contentType,
            ...getCORSHeaders(),
            ...additionalHeaders
        }
    });
}
