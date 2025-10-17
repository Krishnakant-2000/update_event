import { useState, useCallback, useRef } from 'react';
import { UploadProgress } from '../types/form.types';
import { uploadService } from '../services/uploadService';

interface UseVideoUploadReturn {
  uploadProgress: UploadProgress | null;
  uploadError: string | null;
  isUploading: boolean;
  uploadVideo: (file: File) => Promise<string>;
  cancelUpload: () => void;
  resetUpload: () => void;
}

/**
 * Custom hook for handling video uploads with progress tracking
 * Requirements: 9.2, 9.5
 */
export function useVideoUpload(): UseVideoUploadReturn {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  
  // Use ref to track if component is mounted to avoid state updates after unmount
  const isMountedRef = useRef<boolean>(true);

  /**
   * Uploads a video file with progress tracking
   * Requirements: 9.2, 9.5
   */
  const uploadVideo = useCallback(async (file: File): Promise<string> => {
    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(null);

    try {
      const result = await uploadService.uploadVideo(file, (progress) => {
        if (isMountedRef.current) {
          setUploadProgress(progress);
        }
      });

      if (isMountedRef.current) {
        setIsUploading(false);
        setUploadProgress({
          loaded: file.size,
          total: file.size,
          percentage: 100,
        });
      }

      return result.url;
    } catch (err) {
      if (isMountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Upload failed';
        setUploadError(errorMessage);
        setIsUploading(false);
        setUploadProgress(null);
      }
      throw err;
    }
  }, []);

  /**
   * Cancels the current upload
   * Requirements: 9.5
   */
  const cancelUpload = useCallback(() => {
    uploadService.cancelUpload();
    
    if (isMountedRef.current) {
      setIsUploading(false);
      setUploadProgress(null);
      setUploadError('Upload cancelled');
    }
  }, []);

  /**
   * Resets the upload state
   */
  const resetUpload = useCallback(() => {
    setUploadProgress(null);
    setUploadError(null);
    setIsUploading(false);
  }, []);

  return {
    uploadProgress,
    uploadError,
    isUploading,
    uploadVideo,
    cancelUpload,
    resetUpload,
  };
}

export default useVideoUpload;
