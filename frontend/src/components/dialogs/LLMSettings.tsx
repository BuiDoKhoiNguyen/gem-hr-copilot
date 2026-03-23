"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { RotateCcw, Zap, Palette, Gauge } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LLM_PRESETS } from "@/lib/api/dialogs";

interface LLMSettingsProps {
  form: UseFormReturn<any>;
}

export function LLMSettings({ form }: LLMSettingsProps) {
  const { t } = useTranslation();

  const applyPreset = (preset: keyof typeof LLM_PRESETS) => {
    const presetValues = LLM_PRESETS[preset];
    form.setValue("llm_settings", presetValues);
  };

  const currentSettings = form.watch("llm_settings");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">{t("dialogs.llmSettings")}</h3>
        <p className="text-sm text-gray-600">
          Fine-tune the AI model behavior with these parameters
        </p>
      </div>

      {/* Presets */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Palette className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium">Quick Presets</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(LLM_PRESETS).map(([key, preset]) => (
            <Button
              key={key}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyPreset(key as keyof typeof LLM_PRESETS)}
              className="flex items-center gap-1"
            >
              {key === "balanced" && <Gauge className="h-3 w-3" />}
              {key === "creative" && <Zap className="h-3 w-3" />}
              {key === "focused" && <Badge className="h-3 w-3" />}
              <span className="capitalize">{key}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Settings Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Temperature */}
        <FormField
          control={form.control}
          name="llm_settings.temperature"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="flex items-center gap-2">
                  🌡️ {t("dialogs.temperature")}
                  <Badge variant="secondary" className="text-xs">
                    {field.value.toFixed(2)}
                  </Badge>
                </FormLabel>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => field.onChange(0.7)}
                  className="h-6 w-6 p-0"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
              <FormControl>
                <div className="px-2">
                  <Slider
                    min={0}
                    max={2}
                    step={0.1}
                    value={[field.value]}
                    onValueChange={([value]) => field.onChange(value)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Conservative</span>
                    <span>Creative</span>
                  </div>
                </div>
              </FormControl>
              <p className="text-xs text-gray-600">
                Lower = more focused and deterministic, Higher = more creative and random
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Top P */}
        <FormField
          control={form.control}
          name="llm_settings.top_p"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="flex items-center gap-2">
                  🎯 Top P
                  <Badge variant="secondary" className="text-xs">
                    {field.value.toFixed(2)}
                  </Badge>
                </FormLabel>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => field.onChange(0.9)}
                  className="h-6 w-6 p-0"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
              <FormControl>
                <div className="px-2">
                  <Slider
                    min={0.1}
                    max={1}
                    step={0.05}
                    value={[field.value]}
                    onValueChange={([value]) => field.onChange(value)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Focused</span>
                    <span>Diverse</span>
                  </div>
                </div>
              </FormControl>
              <p className="text-xs text-gray-600">
                Controls nucleus sampling - lower values focus on most likely tokens
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Max Tokens */}
        <FormField
          control={form.control}
          name="llm_settings.max_tokens"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="flex items-center gap-2">
                  📏 {t("dialogs.maxTokens")}
                  <Badge variant="secondary" className="text-xs">
                    {field.value}
                  </Badge>
                </FormLabel>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => field.onChange(1024)}
                  className="h-6 w-6 p-0"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
              <FormControl>
                <div className="px-2">
                  <Slider
                    min={128}
                    max={4096}
                    step={128}
                    value={[field.value]}
                    onValueChange={([value]) => field.onChange(value)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Short</span>
                    <span>Long</span>
                  </div>
                </div>
              </FormControl>
              <p className="text-xs text-gray-600">
                Maximum length of generated responses (1 token ≈ 0.75 words)
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Frequency Penalty */}
        <FormField
          control={form.control}
          name="llm_settings.frequency_penalty"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="flex items-center gap-2">
                  🔄 {t("dialogs.frequencyPenalty")}
                  <Badge variant="secondary" className="text-xs">
                    {field.value.toFixed(2)}
                  </Badge>
                </FormLabel>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => field.onChange(0.0)}
                  className="h-6 w-6 p-0"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
              <FormControl>
                <div className="px-2">
                  <Slider
                    min={-2}
                    max={2}
                    step={0.1}
                    value={[field.value]}
                    onValueChange={([value]) => field.onChange(value)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Repetitive</span>
                    <span>Varied</span>
                  </div>
                </div>
              </FormControl>
              <p className="text-xs text-gray-600">
                Penalizes repetition - positive values encourage more diverse vocabulary
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Current Configuration Summary */}
      <Card className="p-4 bg-gray-50">
        <div className="flex items-center gap-2 mb-2">
          <Gauge className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium">Current Configuration</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <span className="text-gray-600">Temperature:</span>
            <span className="ml-1 font-medium">{currentSettings.temperature.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-gray-600">Top P:</span>
            <span className="ml-1 font-medium">{currentSettings.top_p.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-gray-600">Max Tokens:</span>
            <span className="ml-1 font-medium">{currentSettings.max_tokens}</span>
          </div>
          <div>
            <span className="text-gray-600">Frequency:</span>
            <span className="ml-1 font-medium">{currentSettings.frequency_penalty.toFixed(2)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}