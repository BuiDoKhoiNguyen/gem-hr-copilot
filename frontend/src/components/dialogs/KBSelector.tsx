"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Database, FileText, Loader2, AlertCircle, Globe, CheckCircle2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useListKnowledgeBases } from "@/lib/hooks/use-knowledge-base";

interface KBSelectorProps {
  form: UseFormReturn<any>;
}

export function KBSelector({ form }: KBSelectorProps) {
  const { t } = useTranslation();
  const { data: knowledgeBases, isLoading, error } = useListKnowledgeBases();

  const selectedKBIds = form.watch("kb_ids") || [];

  const handleKBToggle = (kbId: string, checked: boolean) => {
    const currentIds = selectedKBIds;
    if (checked) {
      form.setValue("kb_ids", [...currentIds, kbId]);
    } else {
      form.setValue("kb_ids", currentIds.filter((id: string) => id !== kbId));
    }
  };

  const selectedCount = selectedKBIds.length;
  const totalDocs = knowledgeBases
    ?.filter(kb => selectedKBIds.includes(kb.id))
    .reduce((sum, kb) => sum + (kb.document_count || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">{t("dialogs.knowledgeBases")}</h3>
        <p className="text-sm text-gray-600">
          Select which knowledge bases this dialog can search through
        </p>
      </div>

      {/* Selection Summary */}
      {selectedCount > 0 && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            <span className="font-medium">
              {selectedCount} knowledge base{selectedCount !== 1 ? 's' : ''} selected
            </span>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              {totalDocs} documents
            </Badge>
          </div>
        </Card>
      )}

      <FormField
        control={form.control}
        name="kb_ids"
        render={() => (
          <FormItem>
            <FormLabel>Available Knowledge Bases</FormLabel>
            <FormControl>
              <div className="space-y-3">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-600">Loading knowledge bases...</span>
                  </div>
                ) : error ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Failed to load knowledge bases. Please try again.
                    </AlertDescription>
                  </Alert>
                ) : !knowledgeBases || knowledgeBases.length === 0 ? (
                  <Alert>
                    <Database className="h-4 w-4" />
                    <AlertDescription>
                      No knowledge bases available. Create at least one knowledge base first.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {knowledgeBases.map((kb) => (
                      <KBCheckboxCard
                        key={kb.id}
                        kb={kb}
                        checked={selectedKBIds.includes(kb.id)}
                        onCheckedChange={(checked) => handleKBToggle(kb.id, checked)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Usage Tips */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-700 font-medium">
            <Database className="h-4 w-4" />
            Knowledge Base Tips
          </div>
          <div className="text-sm text-blue-600 space-y-1">
            <div>• Select multiple KBs to search across different document collections</div>
            <div>• Language-specific KBs work best with matching dialog language</div>
            <div>• More KBs = broader knowledge but potentially slower search</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function KBCheckboxCard({
  kb,
  checked,
  onCheckedChange,
}: {
  kb: any;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  const languageLabel = kb.language === "vi" ? "Tiếng Việt" : "日本語";
  const languageBadgeColor = kb.language === "vi" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700";

  return (
    <Card className={`p-4 cursor-pointer transition-all hover:shadow-md ${
      checked ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
    }`}>
      <div className="flex items-start gap-3" onClick={() => onCheckedChange(!checked)}>
        <Checkbox
          checked={checked}
          onCheckedChange={onCheckedChange}
          className="mt-1"
        />
        <div className="flex-1 space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">{kb.name}</h4>
            <Badge className={`text-xs ${languageBadgeColor} border-0`}>
              <Globe className="h-3 w-3 mr-1" />
              {languageLabel}
            </Badge>
          </div>

          {/* Description */}
          {kb.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {kb.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>{kb.document_count || 0} docs</span>
            </div>
            {kb.chunk_count && (
              <div className="flex items-center gap-1">
                <Database className="h-4 w-4" />
                <span>{kb.chunk_count} chunks</span>
              </div>
            )}
            {kb.embed_model && (
              <Badge variant="outline" className="text-xs">
                {kb.embed_model}
              </Badge>
            )}
          </div>

          {/* Status */}
          {kb.status && (
            <div className="flex items-center gap-1">
              <div className={`h-2 w-2 rounded-full ${
                kb.status === "active" ? "bg-green-500" :
                kb.status === "processing" ? "bg-yellow-500" : "bg-gray-400"
              }`} />
              <span className="text-xs text-gray-600 capitalize">{kb.status}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}