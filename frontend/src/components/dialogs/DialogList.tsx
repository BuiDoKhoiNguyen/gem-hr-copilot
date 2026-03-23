"use client";

import React from "react";
import { Bot, Plus, Edit3, Settings, Globe, Database } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useActiveDialogs } from "@/lib/hooks/use-dialogs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type DialogConfig } from "@/lib/api/dialogs";

interface DialogListProps {
  onCreateDialog: () => void;
  onEditDialog: (dialog: DialogConfig) => void;
  onTestDialog?: (dialog: DialogConfig) => void;
}

export function DialogList({
  onCreateDialog,
  onEditDialog,
  onTestDialog,
}: DialogListProps) {
  const { t } = useTranslation();
  const { data: dialogs, isLoading } = useActiveDialogs();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("dialogs.title")}
          </h1>
          <p className="text-gray-600 mt-1">
            Configure AI bots with different settings, prompts, and knowledge bases
          </p>
        </div>
        <Button onClick={onCreateDialog} className="flex items-center gap-2">
          <Plus size={16} />
          {t("dialogs.create")}
        </Button>
      </div>

      {/* Dialog Cards Grid */}
      {dialogs && dialogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dialogs.map((dialog) => (
            <DialogCard
              key={dialog.id}
              dialog={dialog}
              onEdit={() => onEditDialog(dialog)}
              onTest={() => onTestDialog?.(dialog)}
              t={t}
            />
          ))}
        </div>
      ) : (
        <EmptyState onCreateDialog={onCreateDialog} t={t} />
      )}
    </div>
  );
}

function DialogCard({
  dialog,
  onEdit,
  onTest,
  t,
}: {
  dialog: DialogConfig;
  onEdit: () => void;
  onTest: () => void;
  t: any;
}) {
  const languageLabel = dialog.language === "vi" ? "Tiếng Việt" : "日本語";
  const languageBadgeColor = dialog.language === "vi" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700";

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg group-hover:from-purple-200 group-hover:to-blue-200 transition-colors">
              <Bot className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                {dialog.name}
              </h3>
              <Badge className={`text-xs ${languageBadgeColor} border-0`}>
                <Globe className="h-3 w-3 mr-1" />
                {languageLabel}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit3 size={14} />
          </Button>
        </div>

        {/* Description */}
        {dialog.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {dialog.description}
          </p>
        )}

        {/* Config Summary */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Settings className="h-4 w-4" />
            <span>Model: {dialog.llm_model}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Database className="h-4 w-4" />
            <span>{dialog.kb_ids.length} Knowledge Base(s)</span>
          </div>
        </div>

        {/* LLM Settings Preview */}
        <div className="pt-2 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-gray-500">
              Temp: <span className="text-gray-900 font-medium">{dialog.llm_settings.temperature}</span>
            </div>
            <div className="text-gray-500">
              Max: <span className="text-gray-900 font-medium">{dialog.llm_settings.max_tokens}</span>
            </div>
            <div className="text-gray-500">
              Top-K: <span className="text-gray-900 font-medium">{dialog.top_k}</span>
            </div>
            <div className="text-gray-500">
              Top-N: <span className="text-gray-900 font-medium">{dialog.top_n}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="flex-1"
          >
            <Edit3 size={14} className="mr-1" />
            {t("common.edit")}
          </Button>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onTest();
            }}
            className="flex-1"
          >
            {t("dialogs.test")}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function EmptyState({
  onCreateDialog,
  t
}: {
  onCreateDialog: () => void;
  t: any;
}) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Bot className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No dialogs configured
      </h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">
        Create your first dialog configuration to customize AI behavior, prompts, and knowledge bases
      </p>
      <Button onClick={onCreateDialog} className="flex items-center gap-2">
        <Plus size={16} />
        {t("dialogs.create")}
      </Button>
    </div>
  );
}