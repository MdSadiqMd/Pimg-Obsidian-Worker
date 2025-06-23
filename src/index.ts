import handleImageUpload from "./services/handle_image_upload";
import { getCORSHeaders, handleCORS } from "./utils/cors_configuration";

export interface Env {
    GITHUB_TOKEN: string;
}

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
            return new Response("Obsidian GitHub Worker is Healthy", {
                headers: {
                    ...getCORSHeaders(),
                    "Cache-Control": "max-age=31536000"
                }
            });
        }

        try {
            return await handleImageUpload(request, env);
        } catch (error) {
            console.error("Error handling request:", error);
            return new Response("Internal server error", {
                status: 500,
                headers: getCORSHeaders()
            });
        }
    }
};
