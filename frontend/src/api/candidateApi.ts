import api from "./axiosConfig";

export type CandidateCredentials = {
  email: string;
  password: string;
};

export type CandidateRegisterPayload = CandidateCredentials & {
  fullName: string;
  phone?: string;
  address?: string;
};

export type ApplicationPayload = {
  universityId: number;
  majorId: number;
  subjectGroupId: number;
  scoreMath: number;
  scoreLiterature: number;
  scoreEnglish: number;
  priority: string;
  documents: Array<{ name: string; type: string; size: number }>;
};

export async function loginCandidate(payload: CandidateCredentials) {
  const response = await api.post("/auth/login", payload);
  return response.data;
}

export async function registerCandidate(payload: CandidateRegisterPayload) {
  const response = await api.post("/auth/register", payload);
  return response.data;
}

export async function fetchUniversityData() {
  const response = await api.get("/public/university-data");
  return response.data;
}

export async function submitApplication(payload: ApplicationPayload) {
  const response = await api.post("/candidate/application", payload);
  return response.data;
}

export async function getApplicationStatus() {
  const response = await api.get("/candidate/application");
  return response.data;
}
