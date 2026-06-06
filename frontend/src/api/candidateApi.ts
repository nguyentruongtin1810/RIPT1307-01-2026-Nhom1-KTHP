import api from "./axiosConfig";

// --- CÁC KIỂU DỮ LIỆU ĐĂNG NHẬP / ĐĂNG KÝ (Giữ từ file cũ) ---
export type CandidateCredentials = {
  email: string;
  password: string;
};

export type CandidateRegisterPayload = CandidateCredentials & {
  fullName: string;
  phone?: string;
  address?: string;
};

// --- KIỂU DỮ LIỆU NỘP ĐƠN MỚI (Tối ưu theo JSON database) ---
export type ApplicationPayload = {
  universityId?: number;
  majorId: number;
  subjectGroupId: number;
  score1: number;
  score2: number;
  score3: number;
  documentUrl: string;
};

// --- XUẤT CÁC HÀM AUTH LẺ (Để tương thích ngược với file cũ nếu nhóm cần dùng) ---
export async function loginCandidate(payload: CandidateCredentials) {
  const response = await api.post("/auth/login", payload);
  return response.data;
}

export async function registerCandidate(payload: CandidateRegisterPayload) {
  const response = await api.post("/auth/register", payload);
  return response.data;
}

// --- ĐỐI TƯỢNG ĐIỀU HÀNH CHÍNH (Dành cho các trang Form, Tracking, Dashboard của bạn) ---
export const candidateApi = {
  // Tái sử dụng lại login/register bên trong đối tượng cho đồng bộ
  loginCandidate,
  registerCandidate,

  // 1. Lấy danh mục Trường học
  getUniversities: async () => {
    const response = await api.get("/universities");
    return response.data;
  },

  // 2. Lấy danh mục Ngành học theo ID trường
  getMajorsByUniversity: async (universityId: number) => {
    const response = await api.get(`/universities/${universityId}/majors`);
    return response.data;
  },
  

  // 3. Lấy danh mục Tổ hợp môn
  getSubjectGroupsByMajor: async (
  majorId: number
) => {
  const response = await api.get(
    `/majors/${majorId}/subject-groups`
  );

  return response.data;
},

  // 4. API Nộp đơn xét tuyển: Đóng gói JSON viết hoa (Math, Literature, English)
  submitApplication: async (payload: ApplicationPayload) => {
  const response = await api.post(
    "/candidate/application",
    {
      universityId: payload.universityId,
      majorId: payload.majorId,
      subjectGroupId: payload.subjectGroupId,

      scoreMath: payload.score1,
      scoreLiterature: payload.score2,
      scoreEnglish: payload.score3,

      documents: [payload.documentUrl]
    }
  );

  return response.data;
},

  // 5. API Theo dõi danh sách hồ sơ cá nhân đã nộp
  getApplications: async () => {
    const response = await api.get("/candidate/application");
    return response.data;
  }
};