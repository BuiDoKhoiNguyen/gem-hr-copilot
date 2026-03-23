/**
 * Dialog-related React Query hooks
 * Following the established pattern from use-chat.ts and use-knowledge-base.ts
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listDialogs,
  createDialog,
  updateDialog,
  getDialog,
  type DialogConfig,
  type CreateDialogRequest,
  type UpdateDialogRequest,
} from "@/lib/api/dialogs";

/**
 * Fetch all dialogs
 */
export function useDialogs() {
  return useQuery({
    queryKey: ["dialogs"],
    queryFn: listDialogs,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}

/**
 * Fetch single dialog by ID
 */
export function useDialog(dialogId: string | null) {
  return useQuery({
    queryKey: ["dialogs", dialogId],
    queryFn: () => getDialog(dialogId!),
    enabled: !!dialogId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Create new dialog
 */
export function useCreateDialog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDialog,
    onSuccess: (newDialog) => {
      // Invalidate and refetch dialogs list
      queryClient.invalidateQueries({ queryKey: ["dialogs"] });

      toast.success("Dialog created successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create dialog: ${error.message}`);
    },
  });
}

/**
 * Update existing dialog
 */
export function useUpdateDialog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ dialogId, data }: { dialogId: string; data: UpdateDialogRequest }) =>
      updateDialog(dialogId, data),
    onSuccess: (updatedDialog, { dialogId }) => {
      // Update specific dialog in cache
      queryClient.setQueryData(["dialogs", dialogId], updatedDialog);

      // Invalidate dialogs list to refresh
      queryClient.invalidateQueries({ queryKey: ["dialogs"] });

      toast.success("Dialog updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update dialog: ${error.message}`);
    },
  });
}

/**
 * Helper hook to get active dialogs
 */
export function useActiveDialogs() {
  const { data: dialogs, ...rest } = useDialogs();

  const activeDialogs = dialogs?.filter(dialog => dialog.status === "active") || [];

  return {
    ...rest,
    data: activeDialogs,
  };
}

/**
 * Check if a dialog name is already taken (for validation)
 */
export function useDialogNameExists(name: string, excludeId?: string) {
  const { data: dialogs } = useDialogs();

  const exists = dialogs?.some(
    dialog =>
      dialog.name.toLowerCase() === name.toLowerCase() &&
      dialog.id !== excludeId
  ) || false;

  return exists;
}

/**
 * Get dialog statistics (useful for dashboard)
 */
export function useDialogStats() {
  const { data: dialogs, isLoading } = useDialogs();

  const stats = {
    total: dialogs?.length || 0,
    active: dialogs?.filter(d => d.status === "active").length || 0,
    vi: dialogs?.filter(d => d.language === "vi").length || 0,
    ja: dialogs?.filter(d => d.language === "ja").length || 0,
  };

  return { stats, isLoading };
}