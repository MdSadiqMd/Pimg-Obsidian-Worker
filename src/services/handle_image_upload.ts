import arrayBufferToBase64 from "../utils/array_buffer_to_base64";
import createGitHubGist from "./create_github_gist";
import { getCORSHeaders } from "../utils/cors_configuration";

async function handleImageUpload(request: Request, env: Env): Promise<Response> {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    const githubToken = formData.get("githubAccessToken") as string;
    const githubUsername = formData.get("githubUsername") as string;

    if (!imageFile || !imageFile.type.startsWith("image/")) {
        return new Response("Invalid image file", {
            status: 400,
            headers: getCORSHeaders()
        });
    }

    if (!githubToken || !githubUsername) {
        return new Response("Missing GitHub credentials", {
            status: 400,
            headers: getCORSHeaders()
        });
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = arrayBufferToBase64(arrayBuffer);
    const timestamp = Date.now();
    const fileExtension = imageFile.name.split(".").pop() || "png";
    const fileName = `obsidian-upload-${timestamp}.${fileExtension}`;

    const gistResult = await createGitHubGist(
        githubToken,
        fileName,
        base64Image,
        imageFile.type
    );

    if (!gistResult.success) {
        return new Response(`Gist creation failed: ${gistResult.error}`, {
            status: 500,
            headers: getCORSHeaders()
        });
    }

    // proxy URL for the image
    const url = new URL(request.url);
    const imageUrl = `${url.origin}/gist/${gistResult.gistId}/${fileName}`;

    return new Response(
        JSON.stringify({
            success: true,
            imageUrl,
            fileName,
            gistId: gistResult.gistId
        }),
        {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                ...getCORSHeaders()
            }
        }
    );
}

export default handleImageUpload;