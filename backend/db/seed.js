const pool = require("./connection");

async function insertUniversities() {
  const universities = [
    { code: "BKHN", name: "Đại học Bách Khoa" },
    { code: "KT", name: "Đại học Kinh tế" },
    { code: "SPKT", name: "Đại học Sư phạm Kỹ thuật" }
  ];

  const results = [];
  for (const university of universities) {
    const [result] = await pool.execute(
      "INSERT IGNORE INTO universities (code, name) VALUES (?, ?)",
      [university.code, university.name]
    );
    const id = result.insertId || (await pool.query("SELECT id FROM universities WHERE code = ?", [university.code]))[0][0].id;
    results.push({ id, ...university });
  }
  return results;
}

async function insertMajors(universities) {
  const majors = [
    { code: "CTTT", name: "Công nghệ Thông tin", universityCode: "BKHN" },
    { code: "KTMT", name: "Kỹ thuật Máy tính", universityCode: "BKHN" },
    { code: "QTKD", name: "Quản trị Kinh doanh", universityCode: "KT" },
    { code: "KT", name: "Kế toán", universityCode: "KT" },
    { code: "SPKT", name: "Cơ điện tử", universityCode: "SPKT" }
  ];

  const results = [];
  for (const major of majors) {
    const university = universities.find((u) => u.code === major.universityCode);
    if (!university) continue;

    const [result] = await pool.execute(
      "INSERT IGNORE INTO majors (code, name, university_id) VALUES (?, ?, ?)",
      [major.code, major.name, university.id]
    );
    const id = result.insertId || (await pool.query("SELECT id FROM majors WHERE code = ? AND university_id = ?", [major.code, university.id]))[0][0].id;
    results.push({ id, university_id: university.id, ...major });
  }
  return results;
}

async function insertSubjectGroups() {
  const subjectGroups = [
    { code: "A00", name: "Toán - Lý - Hóa" },
    { code: "A01", name: "Toán - Lý - Tiếng Anh" },
    { code: "D01", name: "Toán - Văn - Tiếng Anh" }
  ];

  const results = [];
  for (const group of subjectGroups) {
    const [result] = await pool.execute(
      "INSERT IGNORE INTO subject_groups (code, name) VALUES (?, ?)",
      [group.code, group.name]
    );
    const id = result.insertId || (await pool.query("SELECT id FROM subject_groups WHERE code = ?", [group.code]))[0][0].id;
    results.push({ id, ...group });
  }
  return results;
}

async function insertMajorSubjectGroups(majors, groups) {
  const mapping = [
    { majorCode: "CTTT", groupCodes: ["A00", "A01"] },
    { majorCode: "KTMT", groupCodes: ["A00", "A01"] },
    { majorCode: "QTKD", groupCodes: ["A00", "D01"] },
    { majorCode: "KT", groupCodes: ["A00", "D01"] },
    { majorCode: "SPKT", groupCodes: ["A00", "A01"] }
  ];

  for (const entry of mapping) {
    const major = majors.find((m) => m.code === entry.majorCode);
    if (!major) continue;
    for (const subjectCode of entry.groupCodes) {
      const group = groups.find((g) => g.code === subjectCode);
      if (!group) continue;
      await pool.execute(
        "INSERT IGNORE INTO major_subject_groups (major_id, subject_group_id) VALUES (?, ?)",
        [major.id, group.id]
      );
    }
  }
}

async function runSeed() {
  try {
    const universities = await insertUniversities();
    const majors = await insertMajors(universities);
    const groups = await insertSubjectGroups();
    await insertMajorSubjectGroups(majors, groups);
    console.log("Seed complete.");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

runSeed();
