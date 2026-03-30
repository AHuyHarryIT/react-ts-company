import axiosPrivate from '@/api/axiosInstance';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type FeedbackType = 'suggestion' | 'bug' | 'complaint' | 'other';
export type FeedbackStatus = 'pending' | 'reviewed' | 'resolved' | 'rejected';

export interface Feedback {
  id: number;
  employee_id: string;
  type: FeedbackType;
  subject: string;
  content: string;
  image: string | null;
  image_url: string | null;
  status: FeedbackStatus;
  admin_reply: string | null;
  replied_by: string | null;
  replied_at: string | null;
  created_at: string;
  updated_at: string;
  // BE trả employee object (admin endpoint)
  employee?: {
    id: string;
    name: string;
    phone?: string;
  };
  // BE trả replied_by_employee object
  replied_by_employee?: {
    id: string;
    name: string;
  } | null;
}

export interface FeedbackListResponse {
  data: Feedback[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface CreateFeedbackPayload {
  type: FeedbackType;
  subject: string;
  content: string;
  image?: File | null;
}

export interface ReplyFeedbackPayload {
  admin_reply: string;
  status?: FeedbackStatus;
}

// ─── Employee API (/api/employee/feedbacks) ────────────────────────────────────

const EMP_ENDPOINT = '/api/employee/feedbacks';

/** GET /api/employee/feedbacks — Employee xem góp ý của mình */
export const fetchMyFeedbacks = async (
  params?: Record<string, unknown>
): Promise<FeedbackListResponse> => {
  const res = await axiosPrivate.get(EMP_ENDPOINT, { params });
  return res as unknown as FeedbackListResponse;
};

/** POST /api/employee/feedbacks — Employee gửi góp ý (multipart/form-data) */
export const createMyFeedback = async (
  payload: CreateFeedbackPayload
): Promise<{ message: string; feedback: Feedback }> => {
  const formData = new FormData();
  formData.append('type', payload.type);
  formData.append('subject', payload.subject);
  formData.append('content', payload.content);
  if (payload.image) {
    formData.append('image', payload.image);
  }
  const res = await axiosPrivate.post(EMP_ENDPOINT, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res as unknown as { message: string; feedback: Feedback };
};

/** GET /api/employee/feedbacks/{id} — Employee xem chi tiết */
export const fetchMyFeedback = async (id: number): Promise<Feedback> => {
  const res = await axiosPrivate.get(`${EMP_ENDPOINT}/${id}`);
  return res as unknown as Feedback;
};

/** DELETE /api/employee/feedbacks/{id} — Employee xóa (chỉ pending) */
export const deleteMyFeedback = async (
  id: number
): Promise<{ message: string }> => {
  const res = await axiosPrivate.delete(`${EMP_ENDPOINT}/${id}`);
  return res as unknown as { message: string };
};

// ─── Admin API (/api/feedbacks) ────────────────────────────────────────────────

const ADMIN_ENDPOINT = '/api/feedbacks';

/** GET /api/feedbacks — Admin xem tất cả góp ý */
export const fetchAllFeedbacks = async (
  params?: Record<string, unknown>
): Promise<FeedbackListResponse> => {
  const res = await axiosPrivate.get(ADMIN_ENDPOINT, { params });
  return res as unknown as FeedbackListResponse;
};

/** GET /api/feedbacks/{id} — Admin xem chi tiết */
export const fetchFeedbackDetail = async (id: number): Promise<Feedback> => {
  const res = await axiosPrivate.get(`${ADMIN_ENDPOINT}/${id}`);
  return res as unknown as Feedback;
};

/** POST /api/feedbacks/{id}/reply — Admin phản hồi góp ý */
export const replyFeedback = async (
  id: number,
  payload: ReplyFeedbackPayload
): Promise<{ message: string; feedback: Feedback }> => {
  const res = await axiosPrivate.post(`${ADMIN_ENDPOINT}/${id}/reply`, payload);
  return res as unknown as { message: string; feedback: Feedback };
};

/** DELETE /api/feedbacks/{id} — Admin xóa góp ý */
export const deleteFeedback = async (
  id: number
): Promise<{ message: string }> => {
  const res = await axiosPrivate.delete(`${ADMIN_ENDPOINT}/${id}`);
  return res as unknown as { message: string };
};
