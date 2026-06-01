USE university_admission;

-- Seed users and candidate profiles
INSERT INTO users (username, password_hash, email, role)
VALUES
  ('admin.user', '$2a$10$rP2DpA9cKurYKPmTQhjGY.DH0iVFUJSXwTSp.45I2wNFHgHt9cBIi', 'admin@university.vn', 'admin'),
  ('nguyenhieu', '$2a$10$6ZEZ5.3zjEDeJNoeFnZaWeRBoJLy/5f/PTL5gGzeuDndP75B61qIW', 'nguyen.hieu@student.vn', 'student'),
  ('phamkim', '$2a$10$qPgV5aH26yyDyu.0ZOwZIu8rGv6EFCmuGGHw/A9/efZOrDZSCWdXy', 'pham.kim@student.vn', 'student'),
  ('tranviet', '$2a$10$J6zCmgB/pK6GX/m9hhOvqudbElxCvJ975hdGzJ8uM7fM8OrCWjGzy', 'tran.viet@student.vn', 'student');

SET @adminUserId = 1;
SET @studentOneId = 2;
SET @studentTwoId = 3;
SET @studentThreeId = 4;

INSERT INTO candidates (user_id, full_name, phone, gender, dob, id_card_number, priority_group)
VALUES
  (@studentOneId, 'Nguyễn Hữu Minh', '+84901234567', 'male', '2004-05-14', '123456789', 'Priority A'),
  (@studentTwoId, 'Phạm Kim Anh', '+84907654321', 'female', '2005-08-21', '987654321', NULL),
  (@studentThreeId, 'Trần Văn Việt', '+84909998877', 'male', '2004-12-02', '112233445', NULL);

-- Seed universities
INSERT INTO universities (code, name, logo_url)
VALUES
  ('FPTPOLY', 'FPT Polytechnic', 'https://example.com/logos/fptpoly.png'),
  ('BACHKHOA', 'Đại học Bách Khoa', 'https://example.com/logos/bachkhoa.png'),
  ('KINHTE', 'Đại học Kinh Tế Quốc Dân', 'https://example.com/logos/kinhtequocdan.png');

SET @fptId = (SELECT id FROM universities WHERE code = 'FPTPOLY');
SET @bkId = (SELECT id FROM universities WHERE code = 'BACHKHOA');
SET @ktqdId = (SELECT id FROM universities WHERE code = 'KINHTE');

-- Seed majors
INSERT INTO majors (university_id, code, name, quota)
VALUES
  (@fptId, 'FPT-IT', 'Công nghệ thông tin', 120),
  (@fptId, 'FPT-BIZ', 'Quản trị kinh doanh', 90),
  (@fptId, 'FPT-ME', 'Cơ điện tử', 60),
  (@bkId, 'BK-IT', 'Kỹ thuật máy tính', 100),
  (@bkId, 'BK-CE', 'Kỹ thuật cơ khí', 80),
  (@bkId, 'BK-EN', 'Kỹ thuật điện tử', 70),
  (@ktqdId, 'KT-ECON', 'Kinh tế quốc tế', 110),
  (@ktqdId, 'KT-FIN', 'Tài chính - Ngân hàng', 100),
  (@ktqdId, 'KT-MKT', 'Marketing', 95);

-- Seed subject groups
INSERT INTO subject_groups (code, name)
VALUES
  ('A00', 'Toán - Lý - Hóa'),
  ('A01', 'Toán - Lý - Tiếng Anh'),
  ('D01', 'Toán - Văn - Tiếng Anh');

SET @a00 = (SELECT id FROM subject_groups WHERE code = 'A00');
SET @a01 = (SELECT id FROM subject_groups WHERE code = 'A01');
SET @d01 = (SELECT id FROM subject_groups WHERE code = 'D01');

-- Map majors to eligible subject groups
INSERT INTO major_subject_groups (major_id, subject_group_id)
VALUES
  ((SELECT id FROM majors WHERE code = 'FPT-IT'), @a00),
  ((SELECT id FROM majors WHERE code = 'FPT-IT'), @a01),
  ((SELECT id FROM majors WHERE code = 'FPT-BIZ'), @a00),
  ((SELECT id FROM majors WHERE code = 'FPT-BIZ'), @d01),
  ((SELECT id FROM majors WHERE code = 'FPT-ME'), @a00),
  ((SELECT id FROM majors WHERE code = 'FPT-ME'), @a01),
  ((SELECT id FROM majors WHERE code = 'BK-IT'), @a00),
  ((SELECT id FROM majors WHERE code = 'BK-IT'), @a01),
  ((SELECT id FROM majors WHERE code = 'BK-EN'), @a01),
  ((SELECT id FROM majors WHERE code = 'BK-CE'), @a00),
  ((SELECT id FROM majors WHERE code = 'KT-ECON'), @d01),
  ((SELECT id FROM majors WHERE code = 'KT-FIN'), @d01),
  ((SELECT id FROM majors WHERE code = 'KT-MKT'), @d01);

-- Seed applications
INSERT INTO applications (candidate_id, major_id, subject_group_id, scores, status, rejection_reason, document_url)
VALUES
  ((SELECT id FROM candidates WHERE user_id = @studentOneId), (SELECT id FROM majors WHERE code = 'FPT-IT'), @a00, '{"Math": 8.5, "Literature": 7.0, "English": 8.0}', 'pending', NULL, 'https://example.com/documents/nguyen_hieu_transcript.pdf'),
  ((SELECT id FROM candidates WHERE user_id = @studentTwoId), (SELECT id FROM majors WHERE code = 'BK-IT'), @a01, '{"Math": 9.0, "Literature": 7.5, "English": 8.8}', 'approved', NULL, 'https://example.com/documents/pham_kim_transcript.pdf');
