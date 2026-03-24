"use client";

import { CheckCircle2, Circle, ExternalLink } from "lucide-react";
import type { ProcessStep } from "@/types";

interface ProcessChecklistProps {
  steps: ProcessStep[];
  messageId: string;
  onToggle: (messageId: string, stepIndex: number) => void;
}

export default function ProcessChecklist({ steps, messageId, onToggle }: ProcessChecklistProps) {
  const completedCount = steps.filter((s) => s.completed).length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <div className="mt-3 bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Quy trình thực hiện
        </span>
        <span className="text-xs font-medium text-primary-400">
          {completedCount}/{steps.length} hoàn thành
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden mb-4">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step, i) => (
          <button
            key={i}
            onClick={() => onToggle(messageId, i)}
            className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all ${
              step.completed
                ? "bg-accent-500/5 border border-accent-500/20"
                : "hover:bg-white/5 border border-transparent"
            }`}
          >
            {step.completed ? (
              <CheckCircle2 className="w-5 h-5 text-accent-400 shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">Bước {step.step}</span>
              </div>
              <p
                className={`text-sm ${
                  step.completed ? "text-gray-500 line-through" : "text-gray-200"
                }`}
              >
                {step.action}
              </p>
              {step.note && (
                <p className="text-xs text-gray-500 mt-1">{step.note}</p>
              )}
            </div>
            {step.url && (
              <a
                href={step.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 w-7 h-7 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 hover:bg-primary-500/20 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
