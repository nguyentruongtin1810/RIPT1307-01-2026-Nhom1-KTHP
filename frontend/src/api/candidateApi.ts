import api from "./axiosClient";

export type CandidateProfile = {
  fullName: string;
  phone: string;
  gender: string;
  dob: string;
  idCardNumber: string;
  priorityGroup: string;
};

export type ApplicationPayload = {
  universityId: number;
  majorId: number;
  subjectGroupId: number;
  scores: Record<string, number>;
  priority: string;
  documents: Array<{ name: string; type: string; size: number }>;
  profile: CandidateProfile;
};

export async function fetchUniversityData() {
  const response = await api.get("/public/university-data");
  return response.data;
}

export async function submitApplication(payload: ApplicationPayload) {
  const response = await api.post("/candidate/application", payload);
  return response.data;
}

export async function getApplicationStatus() {
  const response = await api.get("/student/application/my-status");
  return response.data;
}

export async function getProfile() {
  const response = await api.get("/candidate/profile");
  return response.data;
}

export async function getStudentDashboard() {
  const response = await api.get("/student/dashboard");
  return response.data;
}
