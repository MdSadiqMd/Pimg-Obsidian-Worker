// Cloudflare Worker Environment
export interface Env {
    // Add environment variables here as needed
    // Example: GITHUB_TOKEN?: string;
}

// GitHub API Response Types
export interface GistFile {
    content: string;
    filename?: string;
    type?: string;
    language?: string;
    raw_url?: string;
    size?: number;
}

export interface GistData {
    id: string;
    files: Record<string, GistFile>;
    public: boolean;
    created_at: string;
    updated_at: string;
    description: string;
    url: string;
}

export interface GitHubErrorResponse {
    message: string;
    documentation_url?: string;
}

// Service Response Types
export interface ServiceResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface GistResult extends ServiceResult {
    gistId?: string;
}

export interface IssueResult extends ServiceResult {
    issueNumber?: number;
}

export interface UploadResult extends ServiceResult {
    downloadUrl?: string;
}

// Image Data Structure
export interface ImageData {
    data: string; // base64 encoded image
    mimeType: string;
    uploadedAt: string;
}

// Upload Response
export interface UploadResponse {
    success: boolean;
    imageUrl: string;
    fileName: string;
    gistId: string;
}

// Request Validation Types
export interface UploadFormData {
    image: File;
    githubAccessToken: string;
    githubUsername: string;
}

export interface GistRequestParams {
    gistId: string;
    filename: string;
}
