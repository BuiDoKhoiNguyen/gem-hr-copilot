"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  KnowledgeBaseList,
  CreateKBDialog,
  DocumentUpload,
  DocumentList,
} from "@/components/knowledge";
import type { KnowledgeBase } from "@/lib/api/knowledge-base";
import type { Language } from "@/lib/stores/chatStore";

export default function KnowledgePage() {
  const { t } = useTranslation();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedKB, setSelectedKB] = useState<KnowledgeBase | null>(null);
  const [activeTab, setActiveTab] = useState("documents");

  const handleCreateClick = () => {
    setShowCreateDialog(true);
  };

  const handleEditClick = (kb: KnowledgeBase) => {
    // TODO: Implement edit dialog
    console.log("Edit KB:", kb);
  };

  const handleViewDocuments = (kb: KnowledgeBase) => {
    setSelectedKB(kb);
    setActiveTab("documents");
  };

  const handleBackToList = () => {
    setSelectedKB(null);
  };

  const handleUploadComplete = () => {
    // Refresh document list after upload
    // This will be handled by React Query cache invalidation in the upload hook
  };

  if (selectedKB) {
    // KB Detail View
    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToList}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedKB.name}
            </h1>
            <p className="text-gray-600">{selectedKB.description}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="documents">Tài liệu</TabsTrigger>
            <TabsTrigger value="upload">Tải lên</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="mt-6">
            <DocumentList
              kbId={selectedKB.id}
              onUploadClick={() => setActiveTab("upload")}
            />
          </TabsContent>

          <TabsContent value="upload" className="mt-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-2">Tải lên tài liệu</h2>
                <p className="text-gray-600">
                  Tải lên file PDF để bổ sung vào kho tri thức{" "}
                  <strong>{selectedKB.name}</strong>
                </p>
              </div>

              <DocumentUpload
                language={selectedKB.language as Language}
                onUploadComplete={handleUploadComplete}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Create KB Dialog */}
        <CreateKBDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />
      </div>
    );
  }

  // KB List View
  return (
    <div className="container mx-auto p-6">
      <KnowledgeBaseList
        onCreateClick={handleCreateClick}
        onEditClick={handleEditClick}
        onViewDocuments={handleViewDocuments}
      />

      {/* Create KB Dialog */}
      <CreateKBDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}