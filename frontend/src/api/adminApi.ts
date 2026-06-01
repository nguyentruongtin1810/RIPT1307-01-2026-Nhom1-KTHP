import api from "./axiosConfig";

export async function fetchApplications(filters: { universityId?: number; majorId?: number; status?: string } = {}) {
  const response = await api.get("/admin/applications", { params: filters });
  return response.data;
}

export async function updateApplicationStatus(id: number, status: string) {
  const response = await api.patch(`/admin/applications/${id}/status`, { status });
  return response.data;
}
