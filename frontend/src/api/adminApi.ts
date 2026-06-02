import api from "./axiosConfig";

/**
 * Lấy danh sách toàn bộ hồ sơ xét tuyển kèm bộ lọc
 * @param filters bao gồm universityId, majorId, status và từ khóa tìm kiếm search
 */
export async function fetchApplications(filters: { 
  universityId?: number; 
  majorId?: number; 
  status?: string;
  search?: string; // Bổ sung thêm trường tìm kiếm tên/email thí sinh nếu cần
} = {}) {
  try {
    const response = await api.get("/admin/applications", { params: filters });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Không thể tải danh sách hồ sơ.");
  }
}

/**
 * Cập nhật trạng thái phê duyệt hồ sơ (Duyệt hoặc Từ chối kèm lý do)
 * @param id ID của hồ sơ cần xử lý
 * @param status Trạng thái mới ('Approved' hoặc 'Rejected')
 * @param rejectReason Lý do từ chối (bắt buộc khi status là Rejected)
 */
export async function updateApplicationStatus(id: number, status: string, rejectReason?: string) {
  try {
    // Truyền cả status và rejectReason lên để Backend ghi nhận đầy đủ thông tin
    const response = await api.patch(`/admin/applications/${id}/status`, { 
      status, 
      rejectReason 
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Cập nhật trạng thái hồ sơ thất bại.");
  }
}