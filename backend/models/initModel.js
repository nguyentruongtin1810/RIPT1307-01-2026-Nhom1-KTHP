const bcrypt = require("bcryptjs");

const adminUser = {
  username: "admin.user",
  email: "admin@university.vn",
  password: process.env.ADMIN_PASSWORD || "Admin123!",
  role: "admin"
};

const studentUsers = [
  {
    username: "nguyenhieu",
    email: "nguyen.hieu@student.vn",
    password: process.env.STUDENT_PASSWORD_1 || "Student1!",
    role: "student",
    candidate: {
      full_name: "Nguyễn Hữu Minh",
      phone: "+84901234567",
      gender: "male",
      dob: "2004-05-14",
      id_card_number: "123456789",
      priority_group: "Priority A"
    }
  },
  {
    username: "phamkim",
    email: "pham.kim@student.vn",
    password: process.env.STUDENT_PASSWORD_2 || "Student2!",
    role: "student",
    candidate: {
      full_name: "Phạm Kim Anh",
      phone: "+84907654321",
      gender: "female",
      dob: "2005-08-21",
      id_card_number: "987654321",
      priority_group: null
    }
  },
  {
    username: "tranviet",
    email: "tran.viet@student.vn",
    password: process.env.STUDENT_PASSWORD_3 || "Student3!",
    role: "student",
    candidate: {
      full_name: "Trần Văn Việt",
      phone: "+84909998877",
      gender: "male",
      dob: "2004-12-02",
      id_card_number: "112233445",
      priority_group: null
    }
  }
];

const universities = [
  {
    code: "FPTPOLY",
    name: "FPT Polytechnic",
    logo_url: "https://example.com/logos/fptpoly.png"
  },
  {
    code: "BACHKHOA",
    name: "Đại học Bách Khoa",
    logo_url: "https://example.com/logos/bachkhoa.png"
  },
  {
    code: "KINHTE",
    name: "Đại học Kinh Tế Quốc Dân",
    logo_url: "https://example.com/logos/kinhtequocdan.png"
  }
];

const subjectGroups = [
  { code: "A00", name: "Toán - Lý - Hóa" },
  { code: "A01", name: "Toán - Lý - Tiếng Anh" },
  { code: "D01", name: "Toán - Văn - Tiếng Anh" }
];

const majors = [
  { university: "FPTPOLY", code: "FPT-IT", name: "Công nghệ thông tin", quota: 120, groups: ["A00", "A01"] },
  { university: "FPTPOLY", code: "FPT-BIZ", name: "Quản trị kinh doanh", quota: 90, groups: ["A00", "D01"] },
  { university: "FPTPOLY", code: "FPT-ME", name: "Cơ điện tử", quota: 60, groups: ["A00", "A01"] },
  { university: "BACHKHOA", code: "BK-IT", name: "Kỹ thuật máy tính", quota: 100, groups: ["A00", "A01"] },
  { university: "BACHKHOA", code: "BK-CE", name: "Kỹ thuật cơ khí", quota: 80, groups: ["A00"] },
  { university: "BACHKHOA", code: "BK-EN", name: "Kỹ thuật điện tử", quota: 70, groups: ["A01"] },
  { university: "KINHTE", code: "KT-ECON", name: "Kinh tế quốc tế", quota: 110, groups: ["D01"] },
  { university: "KINHTE", code: "KT-FIN", name: "Tài chính - Ngân hàng", quota: 100, groups: ["D01"] },
  { university: "KINHTE", code: "KT-MKT", name: "Marketing", quota: 95, groups: ["D01"] }
];

const applications = [
  {
    studentUsername: "nguyenhieu",
    majorCode: "FPT-IT",
    subjectGroupCode: "A00",
    scores: { Math: 8.5, Literature: 7.0, English: 8.0 },
    status: "pending",
    document_url: "https://example.com/documents/nguyen_hieu_transcript.pdf"
  },
  {
    studentUsername: "phamkim",
    majorCode: "BK-IT",
    subjectGroupCode: "A01",
    scores: { Math: 9.0, Literature: 7.5, English: 8.8 },
    status: "approved",
    document_url: "https://example.com/documents/pham_kim_transcript.pdf"
  }
];

async function seedInitialData(pool) {
  const [existingUsers] = await pool.query("SELECT COUNT(*) AS count FROM users");
  if (existingUsers[0].count > 0) {
    return;
  }

  const passwordHashAdmin = await bcrypt.hash(adminUser.password, 10);
  const [userResult] = await pool.execute(
    "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)",
    [adminUser.username, adminUser.email, passwordHashAdmin, adminUser.role]
  );
  console.log(`Seeded admin user: ${adminUser.email}`);

  const userIds = {};
  for (const student of studentUsers) {
    const passwordHash = await bcrypt.hash(student.password, 10);
    const [result] = await pool.execute(
      "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [student.username, student.email, passwordHash, student.role]
    );
    await pool.execute(
      "INSERT INTO candidates (user_id, full_name, phone, gender, dob, id_card_number, priority_group) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [result.insertId, student.candidate.full_name, student.candidate.phone, student.candidate.gender, student.candidate.dob, student.candidate.id_card_number, student.candidate.priority_group]
    );
    userIds[student.username] = result.insertId;
  }

  const universityIds = {};
  for (const university of universities) {
    const [result] = await pool.execute(
      "INSERT INTO universities (code, name, logo_url) VALUES (?, ?, ?)",
      [university.code, university.name, university.logo_url]
    );
    universityIds[university.code] = result.insertId;
  }

  const subjectGroupIds = {};
  for (const group of subjectGroups) {
    const [result] = await pool.execute(
      "INSERT INTO subject_groups (code, name) VALUES (?, ?)",
      [group.code, group.name]
    );
    subjectGroupIds[group.code] = result.insertId;
  }

  const majorIds = {};
  for (const major of majors) {
    const [result] = await pool.execute(
      "INSERT INTO majors (university_id, code, name, quota) VALUES (?, ?, ?, ?)",
      [universityIds[major.university], major.code, major.name, major.quota]
    );
    majorIds[major.code] = result.insertId;
    for (const groupCode of major.groups) {
      const groupId = subjectGroupIds[groupCode];
      if (groupId) {
        await pool.execute(
          "INSERT INTO major_subject_groups (major_id, subject_group_id) VALUES (?, ?)",
          [result.insertId, groupId]
        );
      }
    }
  }

  for (const application of applications) {
    const candidateUserId = userIds[application.studentUsername];
    if (!candidateUserId) continue;
    const [candidateRow] = await pool.execute(
      "SELECT id FROM candidates WHERE user_id = ?",
      [candidateUserId]
    );
    const candidateId = candidateRow[0]?.id;
    const majorId = majorIds[application.majorCode];
    const subjectGroupId = subjectGroupIds[application.subjectGroupCode];
    if (!candidateId || !majorId || !subjectGroupId) {
      continue;
    }

    await pool.execute(
      "INSERT INTO applications (candidate_id, major_id, subject_group_id, scores, status, document_url) VALUES (?, ?, ?, ?, ?, ?)",
      [candidateId, majorId, subjectGroupId, JSON.stringify(application.scores), application.status, application.document_url]
    );
  }

  console.log("Seeded initial users, candidates, universities, majors, subject groups, and applications.");
}

module.exports = { seedInitialData };
