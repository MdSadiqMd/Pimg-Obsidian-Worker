import arrayBufferToBase64 from "../utils/array_buffer_to_base64";
import uploadToGitHub from "./upload_to_github";
import { getCORSHeaders } from "../utils/cors_configuration";
import createGitHubIssue from "./create_github_issue";

async function handleImageUpload(request: Request, env: Env): Promise<Response> {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    if (!imageFile || !imageFile.type.startsWith("image/")) {
        return new Response("Invalid image file", {
            status: 400,
            headers: getCORSHeaders()
        });
    }
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = arrayBufferToBase64(arrayBuffer);
    const timestamp = Date.now();
    const fileExtension = imageFile.name.split(".").pop() || "png";
    const fileName = `obsidian-upload-${timestamp}.${fileExtension}`;
    const GITHUB_OWNER = formData.get("githubUsername") as string;
    const GITHUB_REPO = formData.get("githubRepository") as string;
    const uploadResult = await uploadToGitHub(
        formData.get("githubAccessToken") as string,
        GITHUB_OWNER,
        GITHUB_REPO,
        fileName,
        base64Image
    );

    if (!uploadResult.success) {
        return new Response(`GitHub upload failed: ${uploadResult.error}`, {
            status: 500,
            headers: getCORSHeaders()
        });
    }

    const issueResult = await createGitHubIssue(
        formData.get("githubAccessToken") as string,
        GITHUB_OWNER,
        GITHUB_REPO,
        fileName,
        uploadResult.downloadUrl as string
    );
    if (!issueResult.success) {
        return new Response(`Issue creation failed: ${issueResult.error}`, {
            status: 500,
            headers: getCORSHeaders()
        });
    }

    return new Response(
        JSON.stringify({
            success: true,
            imageUrl: uploadResult.downloadUrl,
            fileName,
            issueNumber: issueResult.issueNumber
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