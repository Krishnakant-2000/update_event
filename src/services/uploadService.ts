import { UploadProgress } from '../types/form.types';
import { validateVideoFile } from '../utils/validation';
import { VIDEO_UPLOAD_ERRORS } from '../utils/constants';

// API configuration
const API_BASE_URL = '/api';

interface UploadResult {
  url: string;
  thumbnailUrl?: string;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
}

class UploadService {
  private abortController: AbortController | null = null;

  /**
   * Validates a video file before upload
   * Requirements: 9.3, 9.4
   */
  validateVideoFile(file: File): ValidationResult {
    const error = validateVideoFile(file);
    
    if (error) {
      return { valid: false, error };
    }
    
    return { valid: true };
  }

  /**
   * Uploads a video file with progress tracking
   * Requirements: 9.2, 9.5
   */
  async uploadVideo(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    // Validate file before upload
    const validation = this.validateVideoFile(file);
    if (!validation.valid) {
      throw new Error(validation.error || VIDEO_UPLOAD_ERRORS.INVALID_FORMAT);
    }

    // Create abort controller for cancellation support
    this.abortController = new AbortController();

    try {
      const formData = new FormData();
      formData.append('video', file);

      // Use XMLHttpRequest for progress tracking
      return await this.uploadWithProgress(formData, onProgress);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Upload cancelled');
        }
        throw new Error(error.message || VIDEO_UPLOAD_ERRORS.UPLOAD_FAILED);
      }
      throw new Error(VIDEO_UPLOAD_ERRORS.UPLOAD_FAILED);
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Internal method to handle upload with progress tracking using XMLHttpRequest
   */
  private uploadWithProgress(
    formData: FormData,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress: UploadProgress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
          };
          onProgress(progress);
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response.data);
          } catch (error) {
            reject(new Error('Invalid response from server'));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.message || VIDEO_UPLOAD_ERRORS.UPLOAD_FAILED));
          } catch (error) {
            reject(new Error(VIDEO_UPLOAD_ERRORS.UPLOAD_FAILED));
          }
        }
      });

      // Handle network errors
      xhr.addEventListener('error', () => {
        reject(new Error(VIDEO_UPLOAD_ERRORS.NETWORK_ERROR));
      });

      // Handle abort
      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      // Set up abort controller
      if (this.abortController) {
        this.abortController.signal.addEventListener('abort', () => {
          xhr.abort();
        });
      }

      // Send request
      xhr.open('POST', `${API_BASE_URL}/upload/video`);
      xhr.withCredentials = true;
      xhr.send(formData);
    });
  }

  /**
   * Cancels the current upload
   * Requirements: 9.5
   */
  cancelUpload(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * Checks if an upload is currently in progress
   */
  isUploading(): boolean {
    return this.abortController !== null;
  }
}

// Export singleton instance
export const uploadService = new UploadService();
export default uploadService;
