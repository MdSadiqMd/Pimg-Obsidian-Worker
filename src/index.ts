export interface Env {
    GITHUB_TOKEN: string;
}

export default {
    async fetch(
        request: Request,
        env: Env,
        ctx: ExecutionContext
    ): Promise<Response> {
        if (request.method === "OPTIONS") {
            return handleCORS();
        }

        if (request.method !== "POST") {
            return new Response("Method not allowed", {
                status: 405,
                headers: getCORSHeaders()
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

function handleCORS(): Response {
    return new Response(null, {
        headers: {
            ...getCORSHeaders(),
            "Access-Control-Max-Age": "86400"
        }
    });
}

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
    const GITHUB_OWNER = "MdSadiqMd";
    const GITHUB_REPO = "Obsidian-Vault";
    const uploadResult = await uploadToGitHub(
        env.GITHUB_TOKEN,
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
        env.GITHUB_TOKEN,
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

async function uploadToGitHub(
    token: string,
    owner: string,
    repo: string,
    fileName: string,
    base64Content: string
): Promise<{ success: boolean; error?: string; downloadUrl?: string; }> {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/images/${fileName}`;

    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Authorization": `token ${token}`,
                "User-Agent": "Cloudflare-Worker",
                "Accept": "application/vnd.github.v3+json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: `Upload image: ${fileName}`,
                content: base64Content,
                branch: "main"
            })
        });

        if (!response.ok) {
            const errorData: any = await response.json();
            return {
                success: false,
                error: `${response.status} - ${errorData.message || "Unknown error"}`
            };
        }

        const data: any = await response.json();
        return {
            success: true,
            downloadUrl: data.content.download_url
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message
        };
    }
}

async function createGitHubIssue(
    token: string,
    owner: string,
    repo: string,
    fileName: string,
    imageUrl: string
): Promise<{ success: boolean; error?: string; issueNumber?: number; }> {
    const url = `https://api.github.com/repos/${owner}/${repo}/issues`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `token ${token}`,
                "User-Agent": "Cloudflare-Worker",
                "Accept": "application/vnd.github.v3+json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: `Image Upload: ${fileName}`,
                body: `![${fileName}](${imageUrl})\n\nUploaded via Obsidian GitHub Worker`
            })
        });

        if (!response.ok) {
            const errorData: any = await response.json();
            return {
                success: false,
                error: `${response.status} - ${errorData.message || "Unknown error"}`
            };
        }

        const data: any = await response.json();
        return {
            success: true,
            issueNumber: data.number
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message
        };
    }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function getCORSHeaders(): Record<string, string> {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    };
}
