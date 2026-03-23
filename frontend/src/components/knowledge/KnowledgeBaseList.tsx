"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Files,
  Globe,
  Calendar,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useListKnowledgeBases,
  useDeleteKnowledgeBase,
} from "@/lib/hooks/use-knowledge-base";
import type { KnowledgeBase } from "@/lib/api/knowledge-base";

interface KnowledgeBaseListProps {
  onCreateClick: () => void;
  onEditClick: (kb: KnowledgeBase) => void;
  onViewDocuments: (kb: KnowledgeBase) => void;
}

export function KnowledgeBaseList({
  onCreateClick,
  onEditClick,
  onViewDocuments,
}: KnowledgeBaseListProps) {
  const { t } = useTranslation();
  const { data: knowledgeBases = [], isLoading } = useListKnowledgeBases();
  const deleteKB = useDeleteKnowledgeBase();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (kb: KnowledgeBase) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa kho tri thức "${kb.name}"?`)) {
      return;
    }

    setDeletingId(kb.id);
    try {
      await deleteKB.mutateAsync(kb.id);
    } finally {
      setDeletingId(null);
    }
  };

  const getLanguageLabel = (lang: string) => {
    return lang === "vi" ? "Tiếng Việt" : "日本語";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("knowledge.title")}
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý kho tri thức và tài liệu của bạn
          </p>
        </div>
        <Button onClick={onCreateClick} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("knowledge.create")}
        </Button>
      </div>

      {/* Knowledge Bases Grid */}
      {knowledgeBases.length === 0 ? (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <FileText className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Chưa có kho tri thức nào
              </h3>
              <p className="text-gray-600 mt-1">
                Tạo kho tri thức đầu tiên để bắt đầu
              </p>
            </div>
            <Button onClick={onCreateClick} className="gap-2">
              <Plus className="h-4 w-4" />
              {t("knowledge.create")}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {knowledgeBases.map((kb) => (
            <Card
              key={kb.id}
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => onViewDocuments(kb)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                      {kb.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {kb.description || "Không có mô tả"}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={kb.language === "vi" ? "default" : "secondary"}
                    className="ml-2"
                  >
                    <Globe className="h-3 w-3 mr-1" />
                    {getLanguageLabel(kb.language)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Files className="h-4 w-4" />
                    <span>
                      {kb.document_count || 0} tài liệu
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>
                      {kb.chunk_count || 0} chunks
                    </span>
                  </div>
                </div>

                {kb.embed_model && (
                  <div className="text-xs text-gray-500">
                    Model: {kb.embed_model}
                  </div>
                )}

                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar className="h-3 w-3" />
                  Tạo ngày {formatDate(kb.created_at)}
                </div>
              </CardContent>

              <CardFooter className="pt-0">
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditClick(kb);
                    }}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    {t("common.edit")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(kb);
                    }}
                    disabled={deletingId === kb.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}