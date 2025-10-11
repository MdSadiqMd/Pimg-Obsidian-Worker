import type { IssueResult, GitHubErrorResponse } from '../types';
import { GITHUB_API_BASE_URL, USER_AGENT } from '../constants';

/**
 * Creates a GitHub Issue with an image
 */
async function createGitHubIssue(
    token: string,
    owner: string,
    repo: string,
    fileName: string,
    imageUrl: string
): Promise<IssueResult> {
    const url = `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/issues`;

    const issuePayload = {
        title: `Image Upload: ${fileName}`,
        body: `![${fileName}](${imageUrl})\n\nUploaded via Pimg Worker`
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
            body: JSON.stringify(issuePayload)
        });

        if (!response.ok) {
            const errorData = await response.json() as GitHubErrorResponse;
            return {
                success: false,
                error: `${response.status} - ${errorData.message || 'Unknown error'}`
            };
        }

        const data = await response.json() as { number: number; };
        return {
            success: true,
            issueNumber: data.number
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
            success: false,
            error: errorMessage
        };
    }
}

export default createGitHubIssue;
