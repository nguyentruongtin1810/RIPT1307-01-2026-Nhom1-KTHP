USE university_admission_prod;

INSERT INTO users (username, password_hash, email, role)
VALUES
  ('admin', '$2a$10$YNzWeEsgqiEVBI7U0N04ZOm657TDuKFDMwFfeTERjSZMkcio.sVbK', 'admin@admission.example.com', 'admin'),
  ('student1', '$2a$10$WlNau1/ombbl7wHEa6JzzeOVDVOf1On8xT5bi6mBOOcTbscpgpVUe', 'lethuy@example.com', 'student'),
  ('student2', '$2a$10$Zr08.xbhnZcBkB8rZGkYv.3jzzTicefMVoQQD0GMHKoOFVpKKn7JW', 'trananh@example.com', 'student');

INSERT INTO candidates (user_id, full_name, phone, gender, dob, id_card_number, priority_group)
VALUES
  (2, 'Lê Thị Huyền', '+84901234567', 'female', '2003-04-12', '012345678', 'Priority 1'),
  (3, 'Trần Anh Sơn', '+84987654321', 'male', '2004-09-03', '987654321', 'None');

INSERT INTO universities (code, name, logo_url, address)
VALUES
  ('FPT', 'FPT Polytechnic', 'https://example.com/logos/fpt-polytechnic.png', 'Hà Nội, Việt Nam'),
  ('BK', 'Đại học Bách Khoa Hà Nội', 'https://example.com/logos/bikh.png', 'Hà Nội, Việt Nam'),
  ('KT', 'Đại học Kinh tế Quốc dân', 'https://example.com/logos/nevu.png', 'Hà Nội, Việt Nam');

INSERT INTO majors (university_id, code, name, quota)
VALUES
  ((SELECT id FROM universities WHERE code = 'FPT'), 'FPT-CTTT', 'Công nghệ Thông tin', 120),
  ((SELECT id FROM universities WHERE code = 'FPT'), 'FPT-QTKD', 'Quản trị Kinh doanh', 100),
  ((SELECT id FROM universities WHERE code = 'BK'), 'BK-CV', 'Công nghệ Vật liệu', 80),
  ((SELECT id FROM universities WHERE code = 'BK'), 'BK-KTMT', 'Kỹ thuật Máy tính', 90),
  ((SELECT id FROM universities WHERE code = 'KT'), 'KT-QTKD', 'Quản trị Kinh doanh', 110),
  ((SELECT id FROM universities WHERE code = 'KT'), 'KT-KT', 'Kế toán', 100);

INSERT INTO subject_groups (code, name)
VALUES
  ('A00', 'Toán - Lý - Hóa'),
  ('A01', 'Toán - Lý - Tiếng Anh'),
  ('D01', 'Toán - Văn - Tiếng Anh'),
  ('C01', 'Văn - Sử - Địa');

INSERT INTO major_subject_groups (major_id, subject_group_id)
VALUES
  ((SELECT id FROM majors WHERE code = 'FPT-CTTT'), (SELECT id FROM subject_groups WHERE code = 'A00')),
  ((SELECT id FROM majors WHERE code = 'FPT-CTTT'), (SELECT id FROM subject_groups WHERE code = 'A01')),
  ((SELECT id FROM majors WHERE code = 'FPT-QTKD'), (SELECT id FROM subject_groups WHERE code = 'D01')),
  ((SELECT id FROM majors WHERE code = 'FPT-QTKD'), (SELECT id FROM subject_groups WHERE code = 'C01')),
  ((SELECT id FROM majors WHERE code = 'BK-CV'), (SELECT id FROM subject_groups WHERE code = 'A00')),
  ((SELECT id FROM majors WHERE code = 'BK-KTMT'), (SELECT id FROM subject_groups WHERE code = 'A00')),
  ((SELECT id FROM majors WHERE code = 'BK-KTMT'), (SELECT id FROM subject_groups WHERE code = 'A01')),
  ((SELECT id FROM majors WHERE code = 'KT-QTKD'), (SELECT id FROM subject_groups WHERE code = 'D01')),
  ((SELECT id FROM majors WHERE code = 'KT-KT'), (SELECT id FROM subject_groups WHERE code = 'A00'));

INSERT INTO applications (candidate_id, major_id, subject_group_id, scores, status, rejection_reason, document_url)
VALUES
  (1, (SELECT id FROM majors WHERE code = 'FPT-CTTT'), (SELECT id FROM subject_groups WHERE code = 'A01'), JSON_OBJECT('math', 8.5, 'literature', 7.0, 'english', 8.0), 'pending', NULL, 'https://example.com/docs/student1_app.pdf'),
  (2, (SELECT id FROM majors WHERE code = 'KT-QTKD'), (SELECT id FROM subject_groups WHERE code = 'D01'), JSON_OBJECT('math', 7.8, 'literature', 8.2, 'english', 7.5), 'approved', NULL, 'https://example.com/docs/student2_app.pdf');
