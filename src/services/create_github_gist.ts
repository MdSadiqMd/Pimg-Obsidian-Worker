import type { GistResult, ImageData, GitHubErrorResponse } from '../types';
import { GITHUB_API_BASE_URL, USER_AGENT, GIST_CONFIG } from '../constants';

/**
 * Creates a GitHub Gist with image data
 */
async function createGitHubGist(
    token: string,
    fileName: string,
    base64Content: string,
    mimeType: string
): Promise<GistResult> {
    const url = `${GITHUB_API_BASE_URL}/gists`;

    const imageData: ImageData = {
        data: base64Content,
        mimeType,
        uploadedAt: new Date().toISOString()
    };

    const gistPayload = {
        description: `${GIST_CONFIG.DESCRIPTION_PREFIX}: ${fileName}`,
        public: GIST_CONFIG.IS_PUBLIC,
        files: {
            [fileName]: {
                content: JSON.stringify(imageData)
            }
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `token ${token}`,
                'User-Agent': USER_AGENT,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(gistPayload)
        });

        if (!response.ok) {
            const errorData = await response.json() as GitHubErrorResponse;
            return {
                success: false,
                error: `${response.status} - ${errorData.message || 'Unknown error'}`
            };
        }

        const data = await response.json() as { id: string; };
        return {
            success: true,
            gistId: data.id
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
            success: false,
            error: errorMessage
        };
    }
}

export default createGitHubGist;
