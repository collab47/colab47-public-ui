import { authState } from '$lib/stores/auth.store';
import { ApiError, apiRequest, getApiBaseUrl } from './client';
import type { ApiErrorPayload } from './types';

export type UploadFolder = 'avatars' | 'covers' | 'projects' | 'posts';

export interface UploadedMediaItem {
  key: string;
  url: string;
  contentType: string;
  sizeBytes: number;
  kind: 'image' | 'video';
  originalName: string;
  folder: UploadFolder;
  storage: 'railway_bucket' | 'local_fallback';
}

export interface UploadConfig {
  bucketConfigured: boolean;
  s3Configured: boolean;
  storageMode: 'railway_bucket' | 'local_fallback' | 'disabled';
  region: string;
  bucket: string | null;
  endpoint: string | null;
  maxImageSizeBytes: number;
  maxVideoSizeBytes: number;
  allowedImageTypes: string[];
  allowedVideoTypes: string[];
}

export interface PresignPostUploadResponse {
  url: string;
  fields: Record<string, string>;
  uploadUrl: string;
  publicUrl: string;
  key: string;
  method: 'POST';
  expiresInSeconds: number;
  contentType: string;
  kind: 'image' | 'video';
  storage: 'railway_bucket';
}

export const uploadsApi = {
  getConfig(): Promise<UploadConfig> {
    return apiRequest<UploadConfig>('/uploads/config', { method: 'GET', auth: false });
  },

  /**
   * Requests a 1-hour Railway Bucket Presigned POST (`url` + `fields`) from the backend.
   */
  presignPostUpload(payload: {
    fileName: string;
    contentType: string;
    folder?: UploadFolder;
    sizeBytes?: number;
  }): Promise<PresignPostUploadResponse> {
    return apiRequest<PresignPostUploadResponse>('/uploads/presign-post', {
      method: 'POST',
      auth: true,
      body: payload,
    });
  },

  /**
   * Uploads a single file directly from the browser to the Railway Bucket using
   * a Presigned POST (`FormData` + `fields` + `Content-Type` + `file`) — zero backend egress.
   */
  async uploadDirectToBucket(
    file: File,
    folder: UploadFolder = 'projects',
  ): Promise<UploadedMediaItem> {
    const contentType = file.type || 'application/octet-stream';
    const presigned = await this.presignPostUpload({
      fileName: file.name,
      contentType,
      folder,
      sizeBytes: file.size,
    });

    const form = new FormData();
    Object.entries(presigned.fields).forEach(([key, value]) => {
      form.append(key, value);
    });
    form.append('Content-Type', presigned.contentType);
    form.append('file', file);

    console.info('[Collab47 Uploads] Direct POST -> Railway Bucket', {
      bucketPostUrl: presigned.url,
      key: presigned.key,
      contentType: presigned.contentType,
      sizeBytes: file.size,
    });

    const postRes = await fetch(presigned.url, {
      method: 'POST',
      body: form,
    });

    if (!postRes.ok) {
      console.error('[Collab47 Uploads] Direct Railway Bucket POST failed', {
        status: postRes.status,
        bucketPostUrl: presigned.url,
      });
      throw new ApiError({
        statusCode: postRes.status,
        errorCode: 'RAILWAY_BUCKET_POST_FAILED',
        message: 'Direct upload to Railway Bucket failed. Check Railway Bucket CORS settings.',
      });
    }

    console.info('[Collab47 Uploads] Direct Railway Bucket upload complete', {
      key: presigned.key,
      serveUrl: presigned.publicUrl,
    });

    return {
      key: presigned.key,
      url: presigned.publicUrl,
      contentType: presigned.contentType,
      sizeBytes: file.size,
      kind: presigned.kind,
      originalName: file.name,
      folder,
      storage: 'railway_bucket',
    };
  },

  /**
   * Server-handled upload fallback (`POST /api/v1/uploads/media?folder=...`)
   * used in local dev (when Railway Bucket is not configured) or if Bucket CORS blocks browser POST.
   */
  async uploadFilesViaBackend(
    files: File[],
    folder: UploadFolder = 'projects',
  ): Promise<UploadedMediaItem[]> {
    if (files.length === 0) return [];

    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file, file.name);
    }

    const token = authState.get().accessToken;
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const url = `${getApiBaseUrl()}/uploads/media?folder=${encodeURIComponent(folder)}`;
    console.info('[Collab47 Uploads] Fallback multipart POST ->', url, {
      fileCount: files.length,
      folder,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      let payload: ApiErrorPayload;
      try {
        payload = (await response.json()) as ApiErrorPayload;
      } catch {
        payload = {
          statusCode: response.status,
          errorCode: 'UPLOAD_FAILED',
          message: response.statusText || 'Failed to upload media.',
        };
      }
      throw new ApiError(payload);
    }

    const data = (await response.json()) as { items: UploadedMediaItem[] };
    return data.items ?? [];
  },

  /**
   * Primary upload helper used across the UI (avatars, covers, projects, posts):
   * 1. Attempts direct browser-to-Railway-Bucket Presigned POST (zero service egress).
   * 2. Falls back seamlessly to backend `/uploads/media` if Railway Bucket is not configured
   *    locally or if Bucket CORS is not yet enabled for the frontend origin.
   */
  async uploadFiles(
    files: File[],
    folder: UploadFolder = 'projects',
  ): Promise<UploadedMediaItem[]> {
    if (files.length === 0) return [];

    try {
      const results: UploadedMediaItem[] = [];
      for (const file of files) {
        const item = await this.uploadDirectToBucket(file, folder);
        results.push(item);
      }
      return results;
    } catch (err) {
      // Do not fall back on validation/auth errors (unsupported type, file too large, 401)
      if (
        err instanceof ApiError &&
        (err.statusCode === 400 || err.statusCode === 401 || err.statusCode === 403)
      ) {
        throw err;
      }

      console.warn(
        '[Collab47 Uploads] Direct Railway Bucket presigned POST unavailable — falling back to backend /uploads/media',
        err instanceof Error ? err.message : String(err),
      );
      return this.uploadFilesViaBackend(files, folder);
    }
  },

  deleteMedia(key: string): Promise<{ deleted: boolean; key: string }> {
    return apiRequest<{ deleted: boolean; key: string }>('/uploads/media', {
      method: 'DELETE',
      auth: true,
      body: { key },
    });
  },
};
