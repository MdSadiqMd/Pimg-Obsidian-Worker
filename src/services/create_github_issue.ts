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

export default createGitHubIssue;