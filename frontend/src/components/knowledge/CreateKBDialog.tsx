"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateKnowledgeBase } from "@/lib/hooks/use-knowledge-base";
import type { Language } from "@/lib/stores/chatStore";

// Validation schema
const createKBSchema = z.object({
  name: z
    .string()
    .min(1, "Tên kho tri thức là bắt buộc")
    .max(100, "Tên không được quá 100 ký tự"),
  language: z.enum(["vi", "ja"]).refine((val) => val === "vi" || val === "ja", {
    message: "Vui lòng chọn ngôn ngữ",
  }),
  embed_model: z.string().optional(),
  description: z.string().max(500, "Mô tả không được quá 500 ký tự").optional(),
});

type CreateKBFormData = z.infer<typeof createKBSchema>;

interface CreateKBDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EMBED_MODELS = [
  { value: "text-embedding-ada-002", label: "OpenAI Ada v2 (Mặc định)" },
  { value: "text-embedding-3-small", label: "OpenAI v3 Small" },
  { value: "text-embedding-3-large", label: "OpenAI v3 Large" },
];

export function CreateKBDialog({ open, onOpenChange }: CreateKBDialogProps) {
  const { t } = useTranslation();
  const createKB = useCreateKnowledgeBase();

  const form = useForm<CreateKBFormData>({
    resolver: zodResolver(createKBSchema),
    defaultValues: {
      name: "",
      language: "vi",
      embed_model: "text-embedding-ada-002",
      description: "",
    },
  });

  const onSubmit = async (data: CreateKBFormData) => {
    try {
      await createKB.mutateAsync(data);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      // Error handled by the hook
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("knowledge.create")}</DialogTitle>
          <DialogDescription>
            Tạo kho tri thức mới để lưu trữ và quản lý tài liệu
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t("knowledge.name")} *</Label>
            <Input
              id="name"
              placeholder="Ví dụ: Quy định nhân sự GEM"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language">{t("knowledge.language")} *</Label>
            <Select
              value={form.watch("language")}
              onValueChange={(value: Language) =>
                form.setValue("language", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn ngôn ngữ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vi">Tiếng Việt</SelectItem>
                <SelectItem value="ja">日本語 (Japanese)</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.language && (
              <p className="text-sm text-red-600">
                {form.formState.errors.language.message}
              </p>
            )}
          </div>

          {/* Embed Model */}
          <div className="space-y-2">
            <Label htmlFor="embed_model">{t("knowledge.embedModel")}</Label>
            <Select
              value={form.watch("embed_model")}
              onValueChange={(value) => form.setValue("embed_model", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn mô hình embedding" />
              </SelectTrigger>
              <SelectContent>
                {EMBED_MODELS.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t("knowledge.description")}</Label>
            <Textarea
              id="description"
              placeholder="Mô tả ngắn về nội dung kho tri thức này..."
              rows={3}
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-600">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createKB.isPending}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={createKB.isPending}>
              {createKB.isPending ? "Đang tạo..." : t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
