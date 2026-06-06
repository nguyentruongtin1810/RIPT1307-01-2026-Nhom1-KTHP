import api from "./axiosClient";

export async function fetchApplications(filters: { universityId?: number; majorId?: number; status?: string } = {}) {
  const response = await api.get("/admin/applications", {
    params: {
      university_id: filters.universityId,
      major_id: filters.majorId,
      status: filters.status
    }
  });
  return response.data;
}

export async function changeApplicationStatus(id: number, status: string, rejection_reason?: string) {
  const response = await api.put(`/admin/applications/${id}/status`, { status, rejection_reason });
  return response.data;
}

export async function getAdminStats() {
  const response = await api.get("/admin/stats");
  return response.data;
}
