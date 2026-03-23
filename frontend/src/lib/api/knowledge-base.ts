/**
 * Knowledge Base API functions
 * CRUD operations for knowledge bases
 */

import { get, post, put, del } from "./client";
import API_ENDPOINTS from "./endpoints";
import type { Language } from "@/lib/stores/chatStore";

// ─── Types ────────────────────────────────────────────────────

export interface KnowledgeBase {
  id: string;
  name: string;
  language: Language;
  embed_model: string;
  description?: string;
  document_count?: number;
  chunk_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateKBRequest {
  name: string;
  language: Language;
  embed_model?: string;
  description?: string;
}

export interface UpdateKBRequest {
  name?: string;
  description?: string;
}

export interface KBDocument {
  id: string;
  filename: string;
  file_size: number;
  upload_date: string;
  status: "processing" | "completed" | "failed";
  chunk_count?: number;
}

// ─── API Functions ────────────────────────────────────────────

/**
 * List all knowledge bases
 */
export async function listKnowledgeBases(): Promise<KnowledgeBase[]> {
  const response = await get<KnowledgeBase[] | { knowledge_bases: KnowledgeBase[] }>(
    API_ENDPOINTS.kb.list
  );

  // Handle both direct array and wrapped object response formats
  if (Array.isArray(response)) {
    return response;
  }
  return (response as { knowledge_bases: KnowledgeBase[] }).knowledge_bases || [];
}

/**
 * Create a new knowledge base
 */
export async function createKnowledgeBase(
  data: CreateKBRequest
): Promise<KnowledgeBase> {
  return await post<KnowledgeBase>(API_ENDPOINTS.kb.create, data);
}

/**
 * Delete a knowledge base (soft delete)
 */
export async function deleteKnowledgeBase(kbId: string): Promise<void> {
  await del(API_ENDPOINTS.kb.delete(kbId));
}

/**
 * List documents in a knowledge base
 */
export async function listKBDocuments(kbId: string): Promise<KBDocument[]> {
  const response = await get<KBDocument[] | { documents: KBDocument[] }>(
    API_ENDPOINTS.kb.documents(kbId)
  );

  // Handle both direct array and wrapped object response formats
  if (Array.isArray(response)) {
    return response;
  }
  return (response as { documents: KBDocument[] }).documents || [];
}
