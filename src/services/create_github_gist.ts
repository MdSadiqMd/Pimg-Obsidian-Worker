async function createGitHubGist(
    token: string,
    fileName: string,
    base64Content: string,
    mimeType: string
): Promise<{ success: boolean; error?: string; gistId?: string; }> {
    const url = 'https://api.github.com/gists';

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `token ${token}`,
                "User-Agent": "Pimg-Worker",
                "Accept": "application/vnd.github.v3+json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                description: `Image uploaded by Pimg: ${fileName}`,
                public: false, // Secret gist
                files: {
                    [fileName]: {
                        content: JSON.stringify({
                            data: base64Content,
                            mimeType: mimeType,
                            uploadedAt: new Date().toISOString()
                        })
                    }
                }
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
            gistId: data.id
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message
        };
    }
}

export default createGitHubGist;