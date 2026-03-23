"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { Bot, Settings, Database, Brain, Target } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useCreateDialog, useUpdateDialog } from "@/lib/hooks/use-dialogs";
import { DEFAULT_DIALOG_CONFIG, LLM_MODELS, type DialogConfig, type CreateDialogRequest } from "@/lib/api/dialogs";
import { LLMSettings } from "./LLMSettings";
import { KBSelector } from "./KBSelector";
import { PromptEditor } from "./PromptEditor";

// Form validation schema
const dialogSchema = z.object({
  name: z.string().min(1, "Name is required").max(128, "Name too long"),
  description: z.string().optional(),
  language: z.enum(["vi", "ja"]),
  llm_model: z.string().min(1, "Model is required"),
  llm_settings: z.object({
    temperature: z.number().min(0).max(2),
    max_tokens: z.number().min(1).max(8192),
    top_p: z.number().min(0).max(1),
    frequency_penalty: z.number().min(-2).max(2),
  }),
  prompt_config: z.object({
    system: z.string(),
    prologue: z.string().min(1, "Prologue is required"),
    empty_response: z.string().min(1, "Empty response is required"),
  }),
  kb_ids: z.array(z.string()).min(1, "At least one knowledge base is required"),
  top_k: z.number().min(1).max(100),
  top_n: z.number().min(1).max(20),
});

type DialogFormData = z.infer<typeof dialogSchema>;

interface DialogFormProps {
  open: boolean;
  onClose: () => void;
  dialog?: DialogConfig | null; // null = create mode, DialogConfig = edit mode
}

export function DialogForm({ open, onClose, dialog }: DialogFormProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("basic");

  const createDialog = useCreateDialog();
  const updateDialog = useUpdateDialog();

  const isEdit = !!dialog;
  const title = isEdit ? "Edit Dialog" : t("dialogs.create");

  // Initialize form with default or existing data
  const form = useForm<DialogFormData>({
    resolver: zodResolver(dialogSchema),
    defaultValues: dialog ? {
      name: dialog.name,
      description: dialog.description || "",
      language: dialog.language,
      llm_model: dialog.llm_model,
      llm_settings: dialog.llm_settings,
      prompt_config: dialog.prompt_config,
      kb_ids: dialog.kb_ids,
      top_k: dialog.top_k,
      top_n: dialog.top_n,
    } : {
      ...DEFAULT_DIALOG_CONFIG,
      description: "",
    },
  });

  // Reset form when dialog changes
  useEffect(() => {
    if (dialog) {
      form.reset({
        name: dialog.name,
        description: dialog.description || "",
        language: dialog.language,
        llm_model: dialog.llm_model,
        llm_settings: dialog.llm_settings,
        prompt_config: dialog.prompt_config,
        kb_ids: dialog.kb_ids,
        top_k: dialog.top_k,
        top_n: dialog.top_n,
      });
    } else {
      form.reset({
        ...DEFAULT_DIALOG_CONFIG,
        description: "",
      });
    }
  }, [dialog, form]);

  const handleSubmit = async (data: DialogFormData) => {
    try {
      if (isEdit && dialog) {
        await updateDialog.mutateAsync({
          dialogId: dialog.id,
          data: data,
        });
      } else {
        await createDialog.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      // Error is handled by the hook
      console.error("Form submission error:", error);
    }
  };

  const isLoading = createDialog.isPending || updateDialog.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex-1 flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              {/* Tab Navigation */}
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic" className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  Basic
                </TabsTrigger>
                <TabsTrigger value="llm" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  LLM
                </TabsTrigger>
                <TabsTrigger value="knowledge" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  KB
                </TabsTrigger>
                <TabsTrigger value="prompts" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Prompts
                </TabsTrigger>
                <TabsTrigger value="retrieval" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Retrieval
                </TabsTrigger>
              </TabsList>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Basic Information Tab */}
                <TabsContent value="basic" className="space-y-6 p-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("dialogs.name")}</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., GEM Vietnam HR Bot" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("dialogs.language")}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="vi">Tiếng Việt</SelectItem>
                              <SelectItem value="ja">日本語</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe this bot's purpose and capabilities..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="llm_model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("dialogs.model")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select LLM model" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {LLM_MODELS.map((model) => (
                              <SelectItem key={model} value={model}>
                                {model}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                {/* LLM Settings Tab */}
                <TabsContent value="llm" className="p-1">
                  <LLMSettings form={form} />
                </TabsContent>

                {/* Knowledge Bases Tab */}
                <TabsContent value="knowledge" className="p-1">
                  <KBSelector form={form} />
                </TabsContent>

                {/* Prompts Tab */}
                <TabsContent value="prompts" className="p-1">
                  <PromptEditor form={form} />
                </TabsContent>

                {/* Retrieval Settings Tab */}
                <TabsContent value="retrieval" className="space-y-6 p-1">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Retrieval Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="top_k"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("dialogs.topK")}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max="100"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <p className="text-sm text-gray-600">
                              Initial number of documents to retrieve from search
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="top_n"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("dialogs.topN")}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max="20"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <p className="text-sm text-gray-600">
                              Final number after reranking to use for generation
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    {isEdit ? "Updating..." : "Creating..."}
                  </div>
                ) : (
                  t("common.save")
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}