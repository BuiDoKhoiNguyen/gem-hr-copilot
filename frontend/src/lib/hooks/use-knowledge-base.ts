/**
 * Knowledge Base React Query hooks
 * Following documate's pattern: API functions → React Query hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listKnowledgeBases,
  createKnowledgeBase,
  deleteKnowledgeBase,
  listKBDocuments,
  type KnowledgeBase,
  type CreateKBRequest,
} from "@/lib/api/knowledge-base";

/**
 * List all knowledge bases
 */
export function useListKnowledgeBases() {
  return useQuery({
    queryKey: ["knowledgeBases"],
    queryFn: listKnowledgeBases,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Create a new knowledge base
 */
export function useCreateKnowledgeBase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createKnowledgeBase,
    onSuccess: (newKB) => {
      // Invalidate and refetch knowledge bases list
      queryClient.invalidateQueries({ queryKey: ["knowledgeBases"] });

      // Add the new KB to the cache immediately (optimistic update)
      queryClient.setQueryData<KnowledgeBase[]>(
        ["knowledgeBases"],
        (old = []) => [...old, newKB]
      );

      toast.success("Tạo kho tri thức thành công!");
    },
    onError: (error: Error) => {
      toast.error(`Không thể tạo kho tri thức: ${error.message}`);
    },
  });
}

/**
 * Delete a knowledge base
 */
export function useDeleteKnowledgeBase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteKnowledgeBase,
    onSuccess: (_, kbId) => {
      // Remove KB from the list cache
      queryClient.setQueryData<KnowledgeBase[]>(
        ["knowledgeBases"],
        (old = []) => old.filter((kb) => kb.id !== kbId)
      );

      // Remove KB documents from cache
      queryClient.removeQueries({ queryKey: ["kbDocuments", kbId] });

      toast.success("Xóa kho tri thức thành công!");
    },
    onError: (error: Error) => {
      toast.error(`Không thể xóa kho tri thức: ${error.message}`);
    },
  });
}

/**
 * List documents in a knowledge base
 */
export function useKBDocuments(kbId: string | null) {
  return useQuery({
    queryKey: ["kbDocuments", kbId],
    queryFn: () => listKBDocuments(kbId!),
    enabled: !!kbId,
    staleTime: 2 * 60 * 1000, // 2 minutes (documents change more frequently)
  });
}