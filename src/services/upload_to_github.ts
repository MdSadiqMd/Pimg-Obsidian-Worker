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

export default uploadToGitHub;