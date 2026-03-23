/**
 * Document ingestion/upload hooks
 * Handles PDF uploads with progress tracking
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ingestPDF } from "@/lib/api/chat";
import type { Language } from "@/lib/stores/chatStore";

interface UploadProgress {
  progress: number;
  message: string;
}

/**
 * Upload PDF to knowledge base
 */
export function useUploadPDF() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      language,
      onProgress,
    }: {
      file: File;
      language: Language;
      onProgress?: (progress: UploadProgress) => void;
    }) => {
      const jobId = await ingestPDF(file, language, (progress, message) => {
        onProgress?.({ progress, message });
      });
      return jobId;
    },
    onSuccess: (jobId, { file }) => {
      // Invalidate KB documents to show new upload
      queryClient.invalidateQueries({ queryKey: ["kbDocuments"] });

      toast.success(`Tải lên "${file.name}" thành công!`);
    },
    onError: (error: Error, { file }) => {
      toast.error(`Không thể tải lên "${file.name}": ${error.message}`);
    },
  });
}

/**
 * Hook for tracking multiple uploads
 */
export function useMultipleUploads() {
  const uploadPDF = useUploadPDF();

  const uploadMultipleFiles = async (
    files: File[],
    language: Language,
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ) => {
    const results = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const result = await uploadPDF.mutateAsync({
          file,
          language,
          onProgress: (progress) => onProgress?.(i, progress),
        });
        results.push({ file: file.name, success: true, jobId: result });
      } catch (error: any) {
        results.push({ file: file.name, success: false, error: error.message });
      }
    }

    return results;
  };

  return {
    uploadMultipleFiles,
    isUploading: uploadPDF.isPending,
  };
}