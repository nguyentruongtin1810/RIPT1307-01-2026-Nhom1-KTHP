import api from "./axiosConfig";

// --- ĐỊNH NGHĨA CÁC KIỂU DỮ LIỆU ĐỒNG BỘ BACKEND ---
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
  schoolId: number;
  majorId: number;
  subjectGroupId: number;
  scoreMath: number;
  scorePhysics: number;
  scoreChemistry: number;
  priority: string;
  documentUrl: string;
};

// --- HỆ THỐNG HÀM GỌI API (KHỚP 100% ENDPOINTS HỆ THỐNG) ---
export const studentApi = {
  // 1. Phân hệ Xác thực (Auth Module)
  login: async (payload: CandidateCredentials) => {
    const response = await api.post("/api/auth/login", {
      identifier: payload.email,
      password: payload.password
    });
    return response.data;
  },

  register: async (payload: CandidateRegisterPayload) => {
    const response = await api.post("/api/auth/register", {
      username: payload.email.split('@')[0], // Tự động cắt chuỗi lấy username từ email
      email: payload.email,
      password: payload.password,
      fullName: payload.fullName,
      phone: payload.phone
    });
    return response.data;
  },

  // 2. Phân hệ Danh mục (Catalog phục vụ bộ lọc tự động phân cấp)
  getSchools: async () => {
    const response = await api.get("/api/student/schools");
    return response.data;
  },

  getMajorsBySchool: async (schoolId: number) => {
    const response = await api.get(`/api/student/schools/${schoolId}/majors`);
    return response.data;
  },

  getSubjectGroups: async () => {
    const response = await api.get("/api/student/subject-groups");
    return response.data;
  },

  // 3. Phân hệ Hồ sơ (Giao dịch Chuỗi 3 bước xử lý ngầm)
  getApplications: async () => {
    const response = await api.get("/api/student/applications");
    return response.data;
  },

  submitFullWorkflow: async (payload: ApplicationPayload) => {
    // Bước A: Cập nhật thông tin cá nhân (PUT /api/student/profile)
    await api.put("/api/student/profile", {
      address: payload.priority,
      priorityTarget: payload.priority
    });

    // Bước B: Khởi tạo hồ sơ bản nháp (POST /api/student/applications)
    const appResponse: any = await api.post("/api/student/applications");
    const appId = appResponse?.id || appResponse?.data?.id || appResponse?.data?.data?.id;
    if (!appId) throw new Error("Hệ thống không trả về mã định danh hồ sơ nháp.");

    // Bước C: Đẩy nguyện vọng ngành vào hồ sơ (POST /api/student/applications/:id/choices)
    const avgScore = (payload.scoreMath + payload.scorePhysics + payload.scoreChemistry) / 3;
    await api.post(`/api/student/applications/${appId}/choices`, {
      majorId: payload.majorId,
      subjectGroupId: payload.subjectGroupId,
      score: Number(avgScore.toFixed(2))
    });

    // Bước D: Đính kèm tài liệu học bạ minh chứng (POST /api/student/applications/:id/documents)
    await api.post(`/api/student/applications/${appId}/documents`, {
      url: payload.documentUrl
    });

    // Bước E: Nộp đơn chính thức lên hệ thống (PATCH /api/student/applications/:id/submit)
    const finalResponse = await api.patch(`/api/student/applications/${appId}/submit`);
    return finalResponse.data;
  }
};