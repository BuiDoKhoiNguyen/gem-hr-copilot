"use client";

import React, { useState } from "react";
import { DialogForm } from "@/components/dialogs/DialogForm";
import { DialogList } from "@/components/dialogs/DialogList";
import { type DialogConfig } from "@/lib/api/dialogs";

export default function DialogsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingDialog, setEditingDialog] = useState<DialogConfig | null>(null);

  const handleCreateDialog = () => {
    setEditingDialog(null);
    setShowForm(true);
  };

  const handleEditDialog = (dialog: DialogConfig) => {
    setEditingDialog(dialog);
    setShowForm(true);
  };

  const handleTestDialog = (dialog: DialogConfig) => {
    // Navigate to chat page with specific dialog
    // This could be implemented to open chat in a new tab or navigate
    console.log("Testing dialog:", dialog.name);
    // Example: router.push(`/chat?dialog=${dialog.id}`);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingDialog(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <DialogList
        onCreateDialog={handleCreateDialog}
        onEditDialog={handleEditDialog}
        onTestDialog={handleTestDialog}
      />

      <DialogForm
        open={showForm}
        onClose={handleCloseForm}
        dialog={editingDialog}
      />
    </div>
  );
}