"use client";

import { useTranslation } from "react-i18next";
import { File, Calendar, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useKBDocuments } from "@/lib/hooks/use-knowledge-base";
import type { KBDocument } from "@/lib/api/knowledge-base";

interface DocumentListProps {
  kbId: string;
  onUploadClick: () => void;
}

export function DocumentList({ kbId, onUploadClick }: DocumentListProps) {
  const { t } = useTranslation();
  const { data: documents = [], isLoading, error } = useKBDocuments(kbId);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  const getStatusBadge = (status: KBDocument["status"]) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">Hoàn thành</Badge>;
      case "processing":
        return <Badge variant="warning">Đang xử lý</Badge>;
      case "failed":
        return <Badge variant="danger">Thất bại</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Tài liệu</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Không thể tải danh sách tài liệu
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <File className="h-12 w-12 text-gray-400 mx-auto" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Chưa có tài liệu nào
          </h3>
          <p className="text-gray-600 mt-1">
            Tải lên tài liệu PDF đầu tiên để bắt đầu
          </p>
        </div>
        <Button onClick={onUploadClick} className="gap-2">
          <File className="h-4 w-4" />
          Tải lên tài liệu
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Tài liệu ({documents.length})
        </h3>
        <Button onClick={onUploadClick} variant="outline" className="gap-2">
          <File className="h-4 w-4" />
          Tải lên thêm
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên file</TableHead>
              <TableHead>Kích thước</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Chunks</TableHead>
              <TableHead>Ngày tải lên</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4 text-red-500" />
                    <span className="truncate max-w-xs">{doc.filename}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {formatFileSize(doc.file_size)}
                </TableCell>
                <TableCell>{getStatusBadge(doc.status)}</TableCell>
                <TableCell>
                  {doc.chunk_count ? (
                    <span className="text-sm font-medium">
                      {doc.chunk_count}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Calendar className="h-3 w-3" />
                    {formatDate(doc.upload_date)}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      if (confirm(`Bạn có chắc chắn muốn xóa "${doc.filename}"?`)) {
                        // TODO: Implement delete document
                        console.log("Delete document:", doc.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}