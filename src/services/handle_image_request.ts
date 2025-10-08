import { getCORSHeaders } from "../utils/cors_configuration";

async function handleImageRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');

    // Expected format: /gist/{gistId}/{filename}
    if (pathParts.length !== 4 || pathParts[1] !== 'gist') {
        return new Response("Invalid URL format", {
            status: 400,
            headers: getCORSHeaders()
        });
    }

    const gistId = pathParts[2];
    const filename = pathParts[3];

    try {
        const gistResponse = await fetch(`https://api.github.com/gists/${gistId}`, {
            headers: {
                "Accept": "application/vnd.github.v3+json",
                "User-Agent": "Pimg-Worker"
            }
        });

        if (!gistResponse.ok) {
            return new Response("Gist not found", {
                status: 404,
                headers: getCORSHeaders()
            });
        }

        const gistData: any = await gistResponse.json();
        const fileData = gistData.files[filename];

        if (!fileData) {
            return new Response("File not found in gist", {
                status: 404,
                headers: getCORSHeaders()
            });
        }

        const imageData = JSON.parse(fileData.content);
        const base64Data = imageData.data;
        const mimeType = imageData.mimeType || 'image/png';

        // Decode base64 to binary
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        return new Response(bytes, {
            headers: {
                "Content-Type": mimeType,
                "Cache-Control": "public, max-age=86400 ", // Cache for 24hrs
                ...getCORSHeaders()
            }
        });
    } catch (error: any) {
        console.error("Error serving image:", error);
        return new Response("Error serving image", {
            status: 500,
            headers: getCORSHeaders()
        });
    }
}

export default handleImageRequest;