"use client";

import { useState, useRef } from "react";
import { Upload, FileText, Globe, Link as LinkIcon, Loader2, CheckCircle2, X } from "lucide-react";

type UploadMode = "pdf" | "confluence" | "url";

interface DocumentUploadProps {
  knowledgeBases: { id: string; name: string }[];
  onUploadPDF: (file: File, language: string, kbId: string) => Promise<void>;
  onIngestConfluence: (spaceKey: string, language: string, kbId: string) => Promise<void>;
  onIngestURL: (url: string, language: string, kbId: string) => Promise<void>;
}

export default function DocumentUpload({
  knowledgeBases,
  onUploadPDF,
  onIngestConfluence,
  onIngestURL,
}: DocumentUploadProps) {
  const [mode, setMode] = useState<UploadMode>("pdf");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedKB, setSelectedKB] = useState(knowledgeBases[0]?.id || "");
  const [language, setLanguage] = useState("vi");
  const [file, setFile] = useState<File | null>(null);
  const [spaceKey, setSpaceKey] = useState("");
  const [url, setUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setSuccess(false);
    try {
      if (mode === "pdf" && file) {
        await onUploadPDF(file, language, selectedKB);
      } else if (mode === "confluence") {
        await onIngestConfluence(spaceKey, language, selectedKB);
      } else if (mode === "url") {
        await onIngestURL(url, language, selectedKB);
      }
      setSuccess(true);
      setFile(null);
      setSpaceKey("");
      setUrl("");
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  const modes = [
    { id: "pdf" as UploadMode, icon: FileText, label: "PDF Upload" },
    { id: "confluence" as UploadMode, icon: Globe, label: "Confluence" },
    { id: "url" as UploadMode, icon: LinkIcon, label: "URL" },
  ];

  return (
    <div className="glass-card p-6">
      <h3 className="font-semibold text-white mb-4">Thêm tài liệu mới</h3>

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

      {/* Common fields */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Knowledge Base</label>
          <select
            value={selectedKB}
            onChange={(e) => setSelectedKB(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-200 outline-none focus:border-primary-500/50"
          >
            {knowledgeBases.map((kb) => (
              <option key={kb.id} value={kb.id}>{kb.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Ngôn ngữ</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-200 outline-none focus:border-primary-500/50"
          >
            <option value="vi">Tiếng Việt</option>
            <option value="ja">日本語</option>
          </select>
        </div>
      </div>

      {/* Mode-specific input */}
      {mode === "pdf" && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-primary-500/30 hover:bg-primary-500/5 transition-all"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
          />
          {file ? (
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-5 h-5 text-red-400" />
              <span className="text-sm text-gray-200">{file.name}</span>
              <button onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                <X className="w-4 h-4 text-gray-500 hover:text-red-400" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Click hoặc kéo thả file PDF</p>
              <p className="text-xs text-gray-600 mt-1">Tối đa 50MB</p>
            </>
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
        disabled={loading || (mode === "pdf" && !file) || (mode === "confluence" && !spaceKey) || (mode === "url" && !url)}
        className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:from-primary-500 hover:to-primary-400 transition-all"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...</>
        ) : success ? (
          <><CheckCircle2 className="w-4 h-4" /> Thành công!</>
        ) : (
          <><Upload className="w-4 h-4" /> Bắt đầu Ingest</>
        )}
      </button>
    </div>
  );
}
