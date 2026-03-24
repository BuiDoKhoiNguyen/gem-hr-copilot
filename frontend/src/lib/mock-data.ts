import type {
  ChatMessage,
  Citation,
  ProcessStep,
  KnowledgeBase,
  Document,
  QuickPrompts,
  IngestStats,
} from "@/types";

export const mockQuickPrompts: QuickPrompts = {
  vi: [
    "Quy trình xin nghỉ phép như thế nào?",
    "Chính sách bảo hiểm y tế của công ty?",
    "Cách đăng ký OT ngoài giờ?",
    "Quy định về remote work?",
    "Hướng dẫn claim bảo hiểm BSH",
    "Chế độ phúc lợi cho nhân viên mới?",
  ],
  ja: [
    "有給休暇の申請方法は？",
    "会社の健康保険制度について",
    "残業申請の手順は？",
    "リモートワークの規定は？",
  ],
};

export const mockCitations: Citation[] = [
  {
    id: "c1",
    title: "GEMERS' Guidebook - Chương 4: Nghỉ phép",
    url: "#",
    excerpt:
      "Nhân viên chính thức được hưởng 12 ngày phép năm. Nhân viên mới (dưới 12 tháng) được tính pro-rata theo số tháng làm việc.",
    page_number: 23,
    source_type: "pdf",
    relevance_score: 0.95,
  },
  {
    id: "c2",
    title: "Nội Quy Công Ty - Mục 5.2",
    url: "#",
    excerpt:
      "Nhân viên phải đăng ký nghỉ phép trước ít nhất 3 ngày làm việc qua hệ thống HR Portal.",
    page_number: 15,
    source_type: "pdf",
    relevance_score: 0.89,
  },
  {
    id: "c3",
    title: "GEM Documentation - Leave Policy",
    url: "https://confluence.example.com/display/HR/Leave",
    excerpt:
      "Các loại nghỉ phép: Annual Leave, Sick Leave, Personal Leave, Maternity/Paternity Leave.",
    source_type: "confluence",
    relevance_score: 0.82,
  },
];

export const mockProcessSteps: ProcessStep[] = [
  {
    step: 1,
    action: "Kiểm tra số ngày phép còn lại trên HR Portal",
    url: "https://hr.gemcorp.com/leave-balance",
    note: "Đăng nhập bằng email công ty",
    completed: false,
  },
  {
    step: 2,
    action: "Tạo đơn xin nghỉ phép trên hệ thống",
    url: "https://hr.gemcorp.com/leave-request",
    note: "Chọn loại phép, ngày bắt đầu/kết thúc, lý do",
    completed: false,
  },
  {
    step: 3,
    action: "Thông báo cho quản lý trực tiếp",
    note: "Gửi email hoặc nhắn tin cho manager sau khi submit đơn",
    completed: false,
  },
  {
    step: 4,
    action: "Chờ phê duyệt từ quản lý",
    note: "Thường mất 1-2 ngày làm việc. Kiểm tra status trên HR Portal",
    completed: false,
  },
  {
    step: 5,
    action: "Bàn giao công việc trước khi nghỉ",
    note: "Đảm bảo team member biết task cần handle",
    completed: false,
  },
];

export function createWelcomeMessages(): ChatMessage[] {
  return [
    {
      id: "welcome",
      role: "assistant",
      content:
        "Xin chào! Tôi là GEM HR Copilot. Tôi có thể giúp bạn tìm hiểu về chính sách công ty, quy trình HR, và các thủ tục hành chính. Hãy hỏi tôi bất cứ điều gì!",
      timestamp: new Date().toISOString(),
    },
  ];
}

/** @deprecated dùng createWelcomeMessages() */
export const mockConversation = createWelcomeMessages();

const mockInsuranceResponse = `## Chính sách Bảo hiểm Y tế tại GEM Corp

Theo **Hợp đồng Bảo hiểm BSH 2025**, công ty cung cấp gói bảo hiểm sức khỏe toàn diện cho nhân viên:

### 1. Quyền lợi chính
- **Khám ngoại trú**: Chi trả tối đa **2,000,000 VNĐ/lần**, tối đa 30 lần/năm
- **Nội trú**: Chi trả **100%** chi phí phòng (tối đa 1,500,000 VNĐ/ngày)
- **Phẫu thuật**: Bảo lãnh viện phí đến **200,000,000 VNĐ/năm**
- **Thai sản**: Hỗ trợ đến **15,000,000 VNĐ** cho nhân viên nữ

### 2. Đối tượng được bảo hiểm
- Nhân viên chính thức (sau 2 tháng thử việc)
- **Người thân** (vợ/chồng, con): Được mua thêm với giá ưu đãi

### 3. Cách sử dụng
Sử dụng **thẻ bảo hiểm BSH** tại các bệnh viện/phòng khám trong mạng lưới liên kết.

> Bạn có muốn tôi hướng dẫn **quy trình claim bảo hiểm** không?`;

export const mockResponses: Record<string, { content: string; citations: Citation[]; process_steps?: ProcessStep[] }> = {
  "leave": {
    content: `## Quy trình xin nghỉ phép tại GEM Corp

Dựa trên **GEMERS' Guidebook** và **Nội Quy Công Ty**, quy trình xin nghỉ phép gồm 5 bước:

### Thông tin chung
- **Số ngày phép năm**: 12 ngày (nhân viên chính thức)
- **Nhân viên mới**: Tính pro-rata theo số tháng làm việc
- **Thời hạn đăng ký**: Trước ít nhất **3 ngày làm việc**

Dưới đây là các bước chi tiết:`,
    citations: mockCitations,
    process_steps: mockProcessSteps,
  },
  "insurance": {
    content: mockInsuranceResponse,
    citations: [
      {
        id: "c4",
        title: "BSH Insurance 2025 - Quyền lợi bảo hiểm",
        url: "#",
        excerpt: "Gói bảo hiểm sức khỏe toàn diện bao gồm khám ngoại trú, nội trú, phẫu thuật và thai sản.",
        page_number: 5,
        source_type: "pdf",
        relevance_score: 0.96,
      },
      {
        id: "c5",
        title: "GEMERS' Guidebook - Phúc lợi",
        url: "#",
        excerpt: "Nhân viên chính thức được tham gia bảo hiểm sức khỏe BSH sau 2 tháng thử việc.",
        page_number: 31,
        source_type: "pdf",
        relevance_score: 0.88,
      },
    ],
  },
  "overtime": {
    content: `## Quy trình đăng ký OT (Overtime)

### Điều kiện đăng ký
- Phải được **quản lý trực tiếp phê duyệt** trước khi làm OT
- OT tối đa **40 giờ/tháng** theo quy định pháp luật
- Không được OT quá **4 giờ/ngày**

### Hệ số lương OT
| Thời gian | Hệ số |
|-----------|-------|
| Ngày thường | **150%** |
| Cuối tuần | **200%** |
| Ngày lễ | **300%** |

### Quy trình
1. Tạo yêu cầu OT trên **HR Portal** trước ngày OT
2. Quản lý phê duyệt trên hệ thống
3. Check-in/check-out đúng giờ đăng ký
4. Hệ thống tự tính lương OT vào cuối tháng`,
    citations: [
      {
        id: "c6",
        title: "Nội Quy Công Ty - Mục 6: Làm thêm giờ",
        url: "#",
        excerpt: "Nhân viên làm thêm giờ phải được quản lý phê duyệt trước và không quá 40 giờ/tháng.",
        page_number: 22,
        source_type: "pdf",
        relevance_score: 0.94,
      },
    ],
  },
  "default": {
    content: `Cảm ơn bạn đã hỏi! Dựa trên tài liệu nội bộ của GEM Corp, tôi tìm thấy thông tin liên quan.

Bạn có thể hỏi tôi về:
- **Chính sách nghỉ phép** và các loại leave
- **Bảo hiểm y tế** BSH và cách claim
- **Quy trình OT** và hệ số lương
- **Remote work** policy
- **Onboarding** cho nhân viên mới
- Và nhiều chủ đề HR khác!`,
    citations: [],
  },
};

export function getMockResponse(query: string) {
  const q = query.toLowerCase();
  if (q.includes("nghỉ phép") || q.includes("leave") || q.includes("xin nghỉ"))
    return mockResponses["leave"];
  if (q.includes("bảo hiểm") || q.includes("insurance") || q.includes("bsh"))
    return mockResponses["insurance"];
  if (q.includes("ot") || q.includes("overtime") || q.includes("làm thêm"))
    return mockResponses["overtime"];
  return mockResponses["default"];
}

export const mockKnowledgeBases: KnowledgeBase[] = [
  {
    id: "kb-1",
    name: "Vietnam HR Knowledge Base",
    language: "vi",
    embed_model: "bge-m3",
    description: "Tài liệu HR cho nhân viên Việt Nam: sổ tay nhân viên, nội quy, bảo hiểm BSH",
    created_at: "2025-03-20T10:00:00Z",
    updated_at: "2025-03-23T15:30:00Z",
  },
  {
    id: "kb-2",
    name: "Japan HR Knowledge Base",
    language: "ja",
    embed_model: "bge-m3",
    description: "日本向けHRドキュメント：就業規則、保険、各種手続き",
    created_at: "2025-03-21T09:00:00Z",
    updated_at: "2025-03-23T14:00:00Z",
  },
];

export const mockDocuments: Record<string, Document[]> = {
  "kb-1": [
    {
      id: "doc-1",
      name: "GEMERS_Guidebook_2025.pdf",
      source_type: "pdf",
      language: "vi",
      status: "completed",
      progress: 1.0,
      chunk_count: 156,
      content_hash: "abc123",
      created_at: "2025-03-20T10:30:00Z",
    },
    {
      id: "doc-2",
      name: "Noi_Quy_Cong_Ty.pdf",
      source_type: "pdf",
      language: "vi",
      status: "completed",
      progress: 1.0,
      chunk_count: 89,
      content_hash: "def456",
      created_at: "2025-03-20T11:00:00Z",
    },
    {
      id: "doc-3",
      name: "BSH_Insurance_2025.pdf",
      source_type: "pdf",
      language: "vi",
      status: "completed",
      progress: 1.0,
      chunk_count: 203,
      content_hash: "ghi789",
      created_at: "2025-03-21T08:00:00Z",
    },
    {
      id: "doc-4",
      name: "GEM Documentation (Confluence)",
      source_type: "confluence",
      language: "vi",
      status: "completed",
      progress: 1.0,
      chunk_count: 312,
      content_hash: "jkl012",
      created_at: "2025-03-22T09:00:00Z",
    },
  ],
  "kb-2": [
    {
      id: "doc-5",
      name: "会社規定_2025.pdf",
      source_type: "pdf",
      language: "ja",
      status: "completed",
      progress: 1.0,
      chunk_count: 124,
      content_hash: "mno345",
      created_at: "2025-03-21T10:00:00Z",
    },
    {
      id: "doc-6",
      name: "GEMJPN Confluence",
      source_type: "confluence",
      language: "ja",
      status: "processing",
      progress: 0.67,
      chunk_count: 85,
      content_hash: "pqr678",
      created_at: "2025-03-23T13:00:00Z",
    },
  ],
};

export const mockIngestStats: IngestStats = {
  total_chunks: 969,
  index: "hr_docs",
};
