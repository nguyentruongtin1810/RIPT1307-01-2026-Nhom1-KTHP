// frontend/src/api/adminApi.ts
import api from "./axiosConfig";

export async function fetchApplications(filters: { 
  universityId?: number; 
  majorId?: number; 
  status?: string 
} = {}) {
  const response = await api.get("/admin/applications", { params: filters });
  return response.data;
}

// SỬA ĐỂ HỖ TRỢ LÝ DO TỪ CHỐI
export async function updateApplicationStatus(
  id: number, 
  status: string, 
  rejectionReason?: string
) {
  const payload: any = { status: status.toLowerCase() };

  if (rejectionReason) {
    payload.rejection_reason = rejectionReason;
  }

  const response = await api.patch(`/admin/applications/${id}/status`, payload);
  return response.data;
}