"use client";

import { useState, useRef } from "react";
import { Upload, FileText, Globe, Link as LinkIcon, Loader2, CheckCircle2, X, Files } from "lucide-react";

type UploadMode = "pdf" | "confluence" | "url";

interface BatchFileStatus {
  filename: string;
  job_id: string;
  status: string;
  message: string;
}

interface DocumentUploadProps {
  /** KB đích (KB đầu tiên trong danh sách); để trống thì backend tự gán KB mặc định */
  targetKbName?: string;
  /** true khi API trả về nhiều hơn 1 KB — ingest vẫn chỉ dùng KB đầu tiên */
  multipleKbsListed?: boolean;
  onUploadPDF: (file: File) => Promise<void>;
  onUploadPDFBatch?: (files: File[]) => Promise<{ queued: number; skipped: number; files: BatchFileStatus[] }>;
  onIngestConfluence: (spaceKey: string) => Promise<void>;
  onIngestURL: (url: string) => Promise<void>;
}

export default function DocumentUpload({
  targetKbName,
  multipleKbsListed,
  onUploadPDF,
  onUploadPDFBatch,
  onIngestConfluence,
  onIngestURL,
}: DocumentUploadProps) {
  const [mode, setMode] = useState<UploadMode>("pdf");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [spaceKey, setSpaceKey] = useState("");
  const [url, setUrl] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [batchResults, setBatchResults] = useState<BatchFileStatus[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setSuccess(false);
    setSubmitError(null);
    setBatchResults(null);
    try {
      if (mode === "pdf" && files.length > 0) {
        if (files.length === 1) {
          // Single file → use original endpoint
          await onUploadPDF(files[0]);
        } else if (onUploadPDFBatch) {
          // Multiple files → use batch endpoint with Redis queue
          const result = await onUploadPDFBatch(files);
          setBatchResults(result.files);
        } else {
          // Fallback: upload one by one
          for (const file of files) {
            await onUploadPDF(file);
          }
        }
      } else if (mode === "confluence") {
        await onIngestConfluence(spaceKey);
      } else if (mode === "url") {
        await onIngestURL(url);
      }
      setSuccess(true);
      setFiles([]);
      setSpaceKey("");
      setUrl("");
      setTimeout(() => {
        setSuccess(false);
        setBatchResults(null);
      }, 5000);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Đã có lỗi khi ingest");
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const modes = [
    { id: "pdf" as UploadMode, icon: FileText, label: "PDF Upload" },
    { id: "confluence" as UploadMode, icon: Globe, label: "Confluence" },
    { id: "url" as UploadMode, icon: LinkIcon, label: "URL" },
  ];

  return (
    <div className="glass-card p-6">
      <h3 className="font-semibold text-white mb-1">Thêm tài liệu mới</h3>
      <p className="text-xs text-gray-500 mb-4">
        {targetKbName
          ? `Lưu vào knowledge base: ${targetKbName}`
          : "Chưa có KB trên server — ingest sẽ dùng KB mặc định do backend tạo."}
        {multipleKbsListed && targetKbName ? (
          <span className="block mt-1 text-amber-500/90">
            Có nhiều KB trong hệ thống — luồng này luôn ingest vào KB đầu tiên ở danh sách bên trái.
          </span>
        ) : null}
      </p>

      {submitError && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {submitError}
        </div>
      )}

      {/* Batch results */}
      {batchResults && batchResults.length > 0 && (
        <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs">
          <div className="flex items-center gap-2 text-green-300 font-medium mb-2">
            <CheckCircle2 className="w-4 h-4" />
            Đã queue {batchResults.filter((f) => f.status === "queued").length}/{batchResults.length} files
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {batchResults.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-300">
                <span className={f.status === "queued" ? "text-green-400" : "text-yellow-400"}>
                  {f.status === "queued" ? "✓" : "○"}
                </span>
                <span className="truncate flex-1">{f.filename}</span>
                <span className="text-gray-500 text-[10px]">{f.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mode selector */}
      <div className="flex gap-2 mb-5">
        {modes.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                mode === m.id
                  ? "bg-primary-500/20 text-primary-300 border border-primary-500/30"
                  : "text-gray-400 border border-white/10 hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Mode-specific input */}
      {mode === "pdf" && (
        <div className="space-y-3">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-primary-500/30 hover:bg-primary-500/5 transition-all"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              multiple
              onChange={(e) => {
                const newFiles = Array.from(e.target.files || []);
                setFiles((prev) => [...prev, ...newFiles]);
                e.target.value = ""; // Reset to allow re-selecting same files
              }}
              className="hidden"
            />
            {files.length === 0 ? (
              <>
                <Upload className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Click hoặc kéo thả file PDF</p>
                <p className="text-xs text-gray-600 mt-1">Tối đa 50MB/file · Hỗ trợ nhiều file</p>
              </>
            ) : (
              <div className="flex items-center justify-center gap-2 text-primary-300">
                <Files className="w-5 h-5" />
                <span className="text-sm font-medium">{files.length} file đã chọn</span>
                <span className="text-xs text-gray-500">· Click để thêm</span>
              </div>
            )}
          </div>

          {/* Selected files list */}
          {files.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10"
                >
                  <FileText className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="text-sm text-gray-200 truncate flex-1">{file.name}</span>
                  <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="p-1 hover:bg-red-500/20 rounded"
                  >
                    <X className="w-3 h-3 text-gray-500 hover:text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {mode === "confluence" && (
        <input
          value={spaceKey}
          onChange={(e) => setSpaceKey(e.target.value)}
          placeholder="Confluence Space Key (ví dụ: GEMDOCS)"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-primary-500/50"
        />
      )}

      {mode === "url" && (
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/hr-policy"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-primary-500/50"
        />
      )}

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={loading || (mode === "pdf" && files.length === 0) || (mode === "confluence" && !spaceKey) || (mode === "url" && !url)}
        className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:from-primary-500 hover:to-primary-400 transition-all"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...</>
        ) : success ? (
          <><CheckCircle2 className="w-4 h-4" /> Thành công!</>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            {mode === "pdf" && files.length > 1
              ? `Upload ${files.length} files`
              : "Bắt đầu Ingest"}
          </>
        )}
      </button>
    </div>
  );
}
