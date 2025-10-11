import type { UploadResult, GitHubErrorResponse } from '../types';
import { GITHUB_API_BASE_URL, USER_AGENT } from '../constants';

/**
 * Uploads a file directly to a GitHub repository
 */
async function uploadToGitHub(
    token: string,
    owner: string,
    repo: string,
    fileName: string,
    base64Content: string
): Promise<UploadResult> {
    const url = `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/contents/images/${fileName}`;

    const uploadPayload = {
        message: `Upload image: ${fileName}`,
        content: base64Content,
        branch: 'main'
    };

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'User-Agent': USER_AGENT,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(uploadPayload)
        });

        if (!response.ok) {
            const errorData = await response.json() as GitHubErrorResponse;
            return {
                success: false,
                error: `${response.status} - ${errorData.message || 'Unknown error'}`
            };
        }

        const data = await response.json() as { content: { download_url: string; }; };
        return {
            success: true,
            downloadUrl: data.content.download_url
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
            success: false,
            error: errorMessage
        };
    }
}

export default uploadToGitHub;
