import api from "./axiosClient";

export type ApplicationFilters = {
  universityId?: number;
  majorId?: number;
  status?: string;
};

export async function fetchApplications(filters: ApplicationFilters = {}) {
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

export async function fetchUniversities() {
  const response = await api.get("/admin/universities");
  return response.data;
}

export async function createUniversity(payload: { code: string; name: string; logoUrl?: string }) {
  const response = await api.post("/admin/universities", payload);
  return response.data;
}

export async function updateUniversity(id: number, payload: { code?: string; name?: string; logoUrl?: string }) {
  const response = await api.put(`/admin/universities/${id}`, payload);
  return response.data;
}

export async function deleteUniversity(id: number) {
  const response = await api.delete(`/admin/universities/${id}`);
  return response.data;
}

export async function fetchMajors() {
  const response = await api.get("/admin/majors");
  return response.data;
}

export async function createMajor(payload: { code: string; name: string; quota?: number; universityId: number; subjectGroupIds: number[] }) {
  const response = await api.post("/admin/majors", payload);
  return response.data;
}

export async function updateMajor(id: number, payload: { code?: string; name?: string; quota?: number; universityId?: number; subjectGroupIds?: number[] }) {
  const response = await api.put(`/admin/majors/${id}`, payload);
  return response.data;
}

export async function deleteMajor(id: number) {
  const response = await api.delete(`/admin/majors/${id}`);
  return response.data;
}

export async function fetchSubjectGroups() {
  const response = await api.get("/admin/subject-groups");
  return response.data;
}

export async function createSubjectGroup(payload: { code: string; name: string }) {
  const response = await api.post("/admin/subject-groups", payload);
  return response.data;
}

export async function updateSubjectGroup(id: number, payload: { code?: string; name?: string }) {
  const response = await api.put(`/admin/subject-groups/${id}`, payload);
  return response.data;
}

export async function deleteSubjectGroup(id: number) {
  const response = await api.delete(`/admin/subject-groups/${id}`);
  return response.data;
}
