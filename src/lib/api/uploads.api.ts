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
  storage: 's3' | 'local_fallback';
}

export interface UploadConfig {
  s3Configured: boolean;
  storageMode: 's3' | 'local_fallback' | 'disabled';
  region: string;
  bucket: string | null;
  maxImageSizeBytes: number;
  maxVideoSizeBytes: number;
  allowedImageTypes: string[];
  allowedVideoTypes: string[];
}

export interface PresignUploadResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  method: 'PUT';
  expiresInSeconds: number;
  contentType: string;
  storage: 's3';
}

export const uploadsApi = {
  getConfig(): Promise<UploadConfig> {
    return apiRequest<UploadConfig>('/uploads/config', { method: 'GET', auth: false });
  },

  presignUpload(payload: {
    fileName: string;
    contentType: string;
    folder?: UploadFolder;
    sizeBytes?: number;
  }): Promise<PresignUploadResponse> {
    return apiRequest<PresignUploadResponse>('/uploads/presign', {
      method: 'POST',
      auth: true,
      body: payload,
    });
  },

  /**
   * Uploads one or multiple image/video files to AWS S3 (or local dev fallback)
   * via `POST /api/v1/uploads/media?folder=...`.
   */
  async uploadFiles(
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
          message: response.statusText || 'Failed to upload media to S3.',
        };
      }
      throw new ApiError(payload);
    }

    const data = (await response.json()) as { items: UploadedMediaItem[] };
    return data.items ?? [];
  },

  /**
   * Direct browser-to-S3 upload using a 5-minute pre-signed PUT URL.
   */
  async uploadDirectToS3(
    file: File,
    folder: UploadFolder = 'projects',
  ): Promise<UploadedMediaItem> {
    const presigned = await this.presignUpload({
      fileName: file.name,
      contentType: file.type || 'application/octet-stream',
      folder,
      sizeBytes: file.size,
    });

    const putRes = await fetch(presigned.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': presigned.contentType },
      body: file,
    });

    if (!putRes.ok) {
      throw new ApiError({
        statusCode: putRes.status,
        errorCode: 'S3_PUT_FAILED',
        message: 'Direct upload to Amazon S3 failed. Check S3 bucket CORS rules.',
      });
    }

    return {
      key: presigned.key,
      url: presigned.publicUrl,
      contentType: presigned.contentType,
      sizeBytes: file.size,
      kind: presigned.contentType.startsWith('video/') ? 'video' : 'image',
      originalName: file.name,
      folder,
      storage: 's3',
    };
  },

  deleteMedia(key: string): Promise<{ deleted: boolean; key: string }> {
    return apiRequest<{ deleted: boolean; key: string }>('/uploads/media', {
      method: 'DELETE',
      auth: true,
      body: { key },
    });
  },
};
