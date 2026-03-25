"use client";

import { useCallback, useEffect, useState } from "react";
import { Database, RefreshCw } from "lucide-react";
import KBList from "@/components/knowledge/KBList";
import DocumentUpload from "@/components/knowledge/DocumentUpload";
import IngestStatsComponent from "@/components/knowledge/IngestStats";
import Footer from "@/components/ui/Footer";
import type { Document, IngestStats, KnowledgeBase } from "@/types";
import {
  deleteKnowledgeBase,
  getIngestStats,
  ingestConfluence,
  ingestURL,
  listDocuments,
  listKnowledgeBases,
  uploadPDF,
  uploadPDFBatch,
  waitIngestComplete,
} from "@/lib/api";

export default function KnowledgePage() {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [documents, setDocuments] = useState<Record<string, Document[]>>({});
  const [stats, setStats] = useState<IngestStats>({
    total_chunks: 0,
    index: "gem_hr_docs",
  });
  const [selectedKB, setSelectedKB] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refreshData = useCallback(async (quiet = false) => {
    if (!quiet) setRefreshing(true);
    setLoadError(null);
    try {
      const [kbs, ingestStats] = await Promise.all([
        listKnowledgeBases(),
        getIngestStats(),
      ]);
      setKnowledgeBases(kbs);
      setStats(ingestStats);

      const docMap: Record<string, Document[]> = {};
      await Promise.all(
        kbs.map(async (kb) => {
          docMap[kb.id] = await listDocuments(kb.id, kb.language);
        })
      );
      setDocuments(docMap);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Không tải được dữ liệu từ API");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  const primaryKb = knowledgeBases[0];
  const ingestLanguage = primaryKb?.language ?? "vi";
  const primaryKbId = primaryKb?.id ?? "";

  const handleUploadPDF = async (file: File) => {
    const st = await uploadPDF(file, ingestLanguage, primaryKbId || undefined);
    const finalSt = await waitIngestComplete(st.job_id);
    if (finalSt.status === "failed") {
      throw new Error(finalSt.message || "Ingest PDF thất bại");
    }
    await refreshData(true);
  };

  const handleUploadPDFBatch = async (files: File[]) => {
    const result = await uploadPDFBatch(files, ingestLanguage, primaryKbId || undefined);
    // Don't wait for completion - files are queued for async processing
    // Just refresh to show pending status
    await refreshData(true);
    return result;
  };

  const handleIngestConfluence = async (spaceKey: string) => {
    const st = await ingestConfluence(spaceKey, ingestLanguage, primaryKbId || undefined);
    const finalSt = await waitIngestComplete(st.job_id);
    if (finalSt.status === "failed") {
      throw new Error(finalSt.message || "Sync Confluence thất bại");
    }
    await refreshData(true);
  };

  const handleIngestURL = async (url: string) => {
    const st = await ingestURL(url, ingestLanguage, primaryKbId || undefined);
    const finalSt = await waitIngestComplete(st.job_id);
    if (finalSt.status === "failed") {
      throw new Error(finalSt.message || "Ingest URL thất bại");
    }
    await refreshData(true);
  };

  const handleDeleteKB = async (kbId: string) => {
    if (!confirm("Xóa knowledge base này? Tài liệu liên quan sẽ bị đánh dấu xóa trên server.")) return;
    try {
      await deleteKnowledgeBase(kbId);
      if (selectedKB === kbId) setSelectedKB(null);
      await refreshData(true);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Xóa KB thất bại");
    }
  };

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
              <Database className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Knowledge Base</h1>
              <p className="text-sm text-gray-500">Dữ liệu từ API backend (không dùng mock)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void refreshData()}
            disabled={refreshing || loading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 border border-white/10 hover:bg-white/5 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Làm mới
          </button>
        </div>

        {loadError && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {loadError}
          </div>
        )}

        {loading ? (
          <div className="text-gray-500 text-sm py-12 text-center">Đang tải từ backend…</div>
        ) : (
          <>
            <div className="mb-8">
              <IngestStatsComponent
                stats={stats}
                knowledgeBases={knowledgeBases}
                allDocuments={documents}
              />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <KBList
                  knowledgeBases={knowledgeBases}
                  documents={documents}
                  onSelectKB={setSelectedKB}
                  onDeleteKB={(id) => void handleDeleteKB(id)}
                  selectedKB={selectedKB}
                />
              </div>
              <div>
                <DocumentUpload
                  targetKbName={primaryKb?.name}
                  multipleKbsListed={knowledgeBases.length > 1}
                  onUploadPDF={handleUploadPDF}
                  onUploadPDFBatch={handleUploadPDFBatch}
                  onIngestConfluence={handleIngestConfluence}
                  onIngestURL={handleIngestURL}
                />
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
