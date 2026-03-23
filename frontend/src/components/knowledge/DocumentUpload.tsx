"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { useUploadPDF } from "@/lib/hooks/use-ingest";
import type { Language } from "@/lib/stores/chatStore";
import { cn } from "@/lib/utils/cn";

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

interface DocumentUploadProps {
  language: Language;
  onUploadComplete?: () => void;
  className?: string;
}

export function DocumentUpload({
  language,
  onUploadComplete,
  className,
}: DocumentUploadProps) {
  const { t } = useTranslation();
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadPDF = useUploadPDF();

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newFiles: UploadFile[] = files
      .filter((file) => file.type === "application/pdf")
      .map((file) => ({
        file,
        id: Math.random().toString(36),
        progress: 0,
        status: "pending",
      }));

    setUploadFiles((prev) => [...prev, ...newFiles]);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (id: string) => {
    setUploadFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const uploadAllFiles = async () => {
    const pendingFiles = uploadFiles.filter((f) => f.status === "pending");

    for (const uploadFile of pendingFiles) {
      // Update status to uploading
      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, status: "uploading", progress: 0 } : f
        )
      );

      try {
        await uploadPDF.mutateAsync({
          file: uploadFile.file,
          language,
          onProgress: ({ progress }) => {
            setUploadFiles((prev) =>
              prev.map((f) =>
                f.id === uploadFile.id ? { ...f, progress } : f
              )
            );
          },
        });

        // Mark as success
        setUploadFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: "success", progress: 100 }
              : f
          )
        );
      } catch (error: any) {
        // Mark as error
        setUploadFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: "error", error: error.message }
              : f
          )
        );
      }
    }

    // Call callback if all uploads completed
    if (onUploadComplete) {
      onUploadComplete();
    }
  };

  const hasPendingFiles = uploadFiles.some((f) => f.status === "pending");
  const isUploading = uploadFiles.some((f) => f.status === "uploading");

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <div className="space-y-4">
          <div>
            <p className="text-lg font-medium text-gray-900">
              Tải lên tài liệu PDF
            </p>
            <p className="text-sm text-gray-600">
              Hỗ trợ file PDF, tối đa 25MB mỗi file
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />

          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Chọn file PDF
          </Button>
        </div>
      </div>

      {/* File List */}
      {uploadFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">
              File đã chọn ({uploadFiles.length})
            </h3>
            {hasPendingFiles && (
              <Button
                onClick={uploadAllFiles}
                disabled={isUploading}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {isUploading ? "Đang tải lên..." : "Tải lên tất cả"}
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {uploadFiles.map((uploadFile) => (
              <Card key={uploadFile.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <File className="h-8 w-8 text-red-500 shrink-0" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">
                          {uploadFile.file.name}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatFileSize(uploadFile.file.size)}
                        </span>
                      </div>

                      {uploadFile.status === "uploading" && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                            <span>Đang tải lên...</span>
                            <span>{uploadFile.progress}%</span>
                          </div>
                          <Progress value={uploadFile.progress} />
                        </div>
                      )}

                      {uploadFile.status === "error" && (
                        <p className="text-xs text-red-600 mt-1">
                          Lỗi: {uploadFile.error}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {uploadFile.status === "success" && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {uploadFile.status === "error" && (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      {uploadFile.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(uploadFile.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}