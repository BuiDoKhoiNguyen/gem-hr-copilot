"use client";

import { FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ProcessGuide } from "@/lib/stores/chatStore";

interface ProcessGuideCardProps {
  guide: ProcessGuide;
}

export function ProcessGuideCard({ guide }: ProcessGuideCardProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-3 rounded-xl p-4 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full flex items-center justify-center bg-blue-600 text-white">
          <FileText className="h-4 w-4" />
        </div>
        <p className="font-semibold text-sm text-gray-900">{guide.title}</p>
      </div>

      <div className="flex flex-col gap-2">
        {guide.steps.map((step) => (
          <div key={step.step} className="flex items-start gap-3">
            <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-blue-100 text-blue-700 border border-blue-300">
              {step.step}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                {step.action}
                {step.url && (
                  <a
                    href={step.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 text-blue-600 hover:text-blue-700"
                  >
                    ↗
                  </a>
                )}
              </p>
              {step.note && (
                <p className="text-xs mt-0.5 italic text-gray-500">
                  💡 {step.note}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {guide.contact && (
        <p className="text-xs mt-3 pt-2 text-gray-500 border-t border-gray-200">
          📧 {t("chat.processGuide.contact")}:{" "}
          <a
            href={`mailto:${guide.contact}`}
            className="text-blue-600 hover:text-blue-700"
          >
            {guide.contact}
          </a>
        </p>
      )}
    </div>
  );
}
