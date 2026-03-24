"use client";

import { useState } from "react";
import { Database } from "lucide-react";
import KBList from "@/components/knowledge/KBList";
import DocumentUpload from "@/components/knowledge/DocumentUpload";
import IngestStatsComponent from "@/components/knowledge/IngestStats";
import { mockKnowledgeBases, mockDocuments, mockIngestStats } from "@/lib/mock-data";
import Footer from "@/components/ui/Footer";

export default function KnowledgePage() {
  const [selectedKB, setSelectedKB] = useState<string | null>(null);
  const [knowledgeBases] = useState(mockKnowledgeBases);
  const [documents] = useState(mockDocuments);

  const handleUploadPDF = async (file: File, language: string, kbId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("Upload PDF:", file.name, language, kbId);
  };

  const handleIngestConfluence = async (spaceKey: string, language: string, kbId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("Ingest Confluence:", spaceKey, language, kbId);
  };

  const handleIngestURL = async (url: string, language: string, kbId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("Ingest URL:", url, language, kbId);
  };

  const handleDeleteKB = (kbId: string) => {
    console.log("Delete KB:", kbId);
  };

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
            <Database className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Knowledge Base</h1>
            <p className="text-sm text-gray-500">Quản lý tài liệu và knowledge bases</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <IngestStatsComponent
            stats={mockIngestStats}
            knowledgeBases={knowledgeBases}
            allDocuments={documents}
          />
        </div>

        {/* Main content */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <KBList
              knowledgeBases={knowledgeBases}
              documents={documents}
              onSelectKB={setSelectedKB}
              onDeleteKB={handleDeleteKB}
              selectedKB={selectedKB}
            />
          </div>
          <div>
            <DocumentUpload
              knowledgeBases={knowledgeBases.map((kb) => ({ id: kb.id, name: kb.name }))}
              onUploadPDF={handleUploadPDF}
              onIngestConfluence={handleIngestConfluence}
              onIngestURL={handleIngestURL}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
