"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Brain, Eye, EyeOff, Info, Copy, RotateCcw } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface PromptEditorProps {
  form: UseFormReturn<any>;
}

const PROMPT_TEMPLATES = {
  vi: {
    system: `Bạn là GEM HR Copilot, một trợ lý AI chuyên nghiệp hỗ trợ nhân viên về các chính sách và quy trình nhân sự tại công ty GEM.

Vai trò của bạn:
- Trả lời các câu hỏi về chính sách HR, quy trình, lợi ích nhân viên
- Hướng dẫn các thủ tục như xin nghỉ phép, báo cáo, đánh giá hiệu suất
- Cung cấp thông tin chính xác dựa trên tài liệu công ty

Nguyên tắc làm việc:
- Luôn thân thiện và chuyên nghiệp
- Chỉ sử dụng thông tin từ tài liệu được cung cấp
- Nếu không có thông tin, hãy hướng dẫn liên hệ bộ phận HR
- Trả lời bằng tiếng Việt rõ ràng, dễ hiểu`,
    prologue: "Xin chào! Tôi là GEM HR Copilot. Tôi có thể giúp bạn tìm hiểu về các chính sách HR, quy trình công ty, và trả lời các câu hỏi về nhân sự. Bạn cần hỗ trợ gì hôm nay?",
    empty_response: "Xin lỗi, tôi không tìm thấy thông tin này trong tài liệu HR hiện có. Vui lòng liên hệ trực tiếp với bộ phận Nhân sự qua email hr@gem-corp.tech hoặc nhánh 101 để được hỗ trợ chi tiết hơn."
  },
  ja: {
    system: `あなたはGEM HR Copilotです。GEM社の人事ポリシーとプロセスに関する専門的なAIアシスタントです。

あなたの役割:
- 人事ポリシー、プロセス、従業員福利厚生について回答する
- 休暇申請、報告書、人事評価などの手続きをガイドする
- 会社文書に基づいた正確な情報を提供する

作業原則:
- 常に親切で専門的な対応をする
- 提供された文書の情報のみを使用する
- 情報がない場合は、HR部門への連絡を案内する
- 明確で理解しやすい日本語で回答する`,
    prologue: "こんにちは！GEM HR Copilotです。人事ポリシー、社内プロセス、人事関連のご質問にお答えできます。今日はどのようなお手伝いができますか？",
    empty_response: "申し訳ございませんが、現在のHR文書にはこちらの情報が見つかりませんでした。詳しいサポートについては、人事部までメール（hr@gem-corp.tech）または内線101でお問い合わせください。"
  }
};

export function PromptEditor({ form }: PromptEditorProps) {
  const { t } = useTranslation();
  const [showPreview, setShowPreview] = useState(false);

  const language = form.watch("language") || "vi";
  const prompts = form.watch("prompt_config");

  const applyTemplate = (templateKey: keyof typeof PROMPT_TEMPLATES.vi) => {
    const template = PROMPT_TEMPLATES[language as keyof typeof PROMPT_TEMPLATES];
    form.setValue(`prompt_config.${templateKey}`, template[templateKey]);
    toast.success("Template applied!");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2">{t("dialogs.prompts")}</h3>
          <p className="text-sm text-gray-600">
            Configure how the AI behaves and responds to users
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2"
        >
          {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showPreview ? "Hide" : "Preview"}
        </Button>
      </div>

      {/* Template Quick Actions */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Quick Templates</span>
          <Badge variant="secondary">{language === "vi" ? "Tiếng Việt" : "日本語"}</Badge>
        </div>
        <div className="flex gap-2 flex-wrap">
          {Object.keys(PROMPT_TEMPLATES.vi).map((key) => (
            <Button
              key={key}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyTemplate(key as keyof typeof PROMPT_TEMPLATES.vi)}
              className="text-xs"
            >
              Apply {key} template
            </Button>
          ))}
        </div>
      </Card>

      {/* System Prompt */}
      <FormField
        control={form.control}
        name="prompt_config.system"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel className="flex items-center gap-2">
                🧠 {t("dialogs.systemPrompt")}
                <Badge variant="secondary" className="text-xs">
                  {field.value.length} chars
                </Badge>
              </FormLabel>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(field.value)}
                  className="h-7 px-2"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => applyTemplate("system")}
                  className="h-7 px-2"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <FormControl>
              <Textarea
                placeholder="Define the AI's role, personality, and behavior instructions..."
                rows={8}
                {...field}
                className="resize-none font-mono text-sm"
              />
            </FormControl>
            <div className="text-xs text-gray-600">
              The system prompt defines the AI's core behavior and personality. Leave empty to use the default.
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Prologue */}
      <FormField
        control={form.control}
        name="prompt_config.prologue"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel className="flex items-center gap-2">
                👋 {t("dialogs.prologuePrompt")}
                <Badge variant="secondary" className="text-xs">
                  {field.value.length} chars
                </Badge>
              </FormLabel>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(field.value)}
                  className="h-7 px-2"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => applyTemplate("prologue")}
                  className="h-7 px-2"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <FormControl>
              <Textarea
                placeholder="Welcome message shown when users start a new conversation..."
                rows={3}
                {...field}
                className="resize-none"
              />
            </FormControl>
            <div className="text-xs text-gray-600">
              The first message users see when starting a conversation with this bot.
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Empty Response */}
      <FormField
        control={form.control}
        name="prompt_config.empty_response"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel className="flex items-center gap-2">
                ❓ {t("dialogs.emptyResponse")}
                <Badge variant="secondary" className="text-xs">
                  {field.value.length} chars
                </Badge>
              </FormLabel>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(field.value)}
                  className="h-7 px-2"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => applyTemplate("empty_response")}
                  className="h-7 px-2"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <FormControl>
              <Textarea
                placeholder="Message shown when no relevant information is found..."
                rows={3}
                {...field}
                className="resize-none"
              />
            </FormControl>
            <div className="text-xs text-gray-600">
              Fallback message when the AI cannot find relevant information to answer the query.
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Preview Panel */}
      {showPreview && (
        <Card className="p-4 bg-gray-50">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-800 font-medium">
              <Eye className="h-4 w-4" />
              Prompt Preview
            </div>

            <div className="space-y-4 text-sm">
              {prompts.system && (
                <div>
                  <div className="font-medium text-gray-700 mb-1">System Prompt:</div>
                  <div className="bg-white p-3 rounded border text-gray-600 whitespace-pre-wrap font-mono text-xs">
                    {prompts.system}
                  </div>
                </div>
              )}

              <div>
                <div className="font-medium text-gray-700 mb-1">Prologue Message:</div>
                <div className="bg-white p-3 rounded border text-gray-800">
                  {prompts.prologue}
                </div>
              </div>

              <div>
                <div className="font-medium text-gray-700 mb-1">No Results Message:</div>
                <div className="bg-white p-3 rounded border text-gray-800">
                  {prompts.empty_response}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Usage Tips */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-1 text-sm">
            <div><strong>System Prompt:</strong> Sets the AI's personality and instructions</div>
            <div><strong>Prologue:</strong> First message users see in new conversations</div>
            <div><strong>Empty Response:</strong> Fallback when no information is found</div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}