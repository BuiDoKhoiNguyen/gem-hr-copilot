/**
 * Chat-related React Query hooks
 * Following documate's pattern: service functions → React Query hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchMessages,
  fetchQuickPrompts,
  type MessageHistoryItem,
} from "@/lib/api/chat";
import type { Language } from "@/lib/stores/chatStore";

/**
 * Fetch message history for a session
 */
export function useFetchMessages(sessionId: string | null) {
  return useQuery({
    queryKey: ["messages", sessionId],
    queryFn: () => fetchMessages(sessionId!),
    enabled: !!sessionId,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch quick prompts (suggested questions)
 */
export function useQuickPrompts(language?: Language) {
  return useQuery({
    queryKey: ["quickPrompts"],
    queryFn: fetchQuickPrompts,
    staleTime: Infinity, // Don't refetch (static data)
    select: (data) => {
      // Filter by language if provided
      if (language) {
        return data[language] || [];
      }
      return data;
    },
  });
}

/**
 * Transform backend message format to frontend Message type
 */
export function transformMessage(msg: MessageHistoryItem) {
  return {
    id: msg.message_id,
    role: msg.role,
    content: msg.content,
    citations: msg.citations,
    processGuide: msg.process_guide,
    confidence: msg.confidence,
    timestamp: new Date(msg.created_at).getTime(),
    isStreaming: false,
  };
}
