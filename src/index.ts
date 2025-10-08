import handleImageUpload from "./services/handle_image_upload";
import handleImageRequest from "./services/handle_image_request";
import { getCORSHeaders, handleCORS } from "./utils/cors_configuration";

export interface Env { }

export default {
    async fetch(
        request: Request,
        env: Env,
        _ctx: ExecutionContext
    ): Promise<Response> {
        if (request.method === "OPTIONS") {
            return handleCORS();
        }

        if (request.method === "GET") {
            const url = new URL(request.url);

            // Handle image serving requests: /gist/{gistId}/{filename}
            if (url.pathname.startsWith('/gist/')) {
                return await handleImageRequest(request);
            }

            return new Response("Pimg Gist Worker is Healthy", {
                headers: {
                    ...getCORSHeaders(),
                    "Cache-Control": "max-age=31536000"
                }
            });
        }

        if (request.method === "POST") {
            try {
                return await handleImageUpload(request, env);
            } catch (error) {
                console.error("Error handling image upload:", error);
                return new Response("Internal server error", {
                    status: 500,
                    headers: getCORSHeaders()
                });
            }
        }

        return new Response("Method not allowed", {
            status: 405,
            headers: getCORSHeaders()
        });
    }
};
