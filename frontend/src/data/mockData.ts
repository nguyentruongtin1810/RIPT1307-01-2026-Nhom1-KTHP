export const mockUniversityData = [
  {
    value: "Đại học Bách Khoa",
    label: "Đại học Bách Khoa",
    children: [
      {
        value: "Công nghệ Thông tin",
        label: "Công nghệ Thông tin",
        children: [
          { value: "A00", label: "A00" },
          { value: "A01", label: "A01" }
        ]
      },
      {
        value: "Kỹ thuật Máy tính",
        label: "Kỹ thuật Máy tính",
        children: [
          { value: "A00", label: "A00" },
          { value: "A01", label: "A01" }
        ]
      }
    ]
  },
  {
    value: "Đại học Kinh tế",
    label: "Đại học Kinh tế",
    children: [
      {
        value: "Quản trị Kinh doanh",
        label: "Quản trị Kinh doanh",
        children: [
          { value: "A00", label: "A00" },
          { value: "D01", label: "D01" }
        ]
      }
    ]
  }
];

export const priorityOptions = [
  { value: "None", label: "Không ưu tiên" },
  { value: "Priority1", label: "Đối tượng 1" },
  { value: "Priority2", label: "Đối tượng 2" }
];

export const mockApplicationDetail = {
  fullName: "Nguyễn Văn B",
  email: "thí.sinh@example.com",
  university: "Đại học Bách Khoa",
  major: "Công nghệ Thông tin",
  subjectGroup: "A00",
  totalScore: 26.5,
  priority: "Đối tượng 1",
  status: "Pending"
};

export const mockUniversities = ["Đại học Bách Khoa", "Đại học Kinh tế"];
export const mockMajors = ["Công nghệ Thông tin", "Kỹ thuật Máy tính", "Quản trị Kinh doanh"];

export const mockApplications = [
  {
    id: 1,
    fullName: "Nguyễn Văn B",
    university: "Đại học Bách Khoa",
    major: "Công nghệ Thông tin",
    totalScore: 26.5,
    status: "Pending"
  },
  {
    id: 2,
    fullName: "Trần Thị C",
    university: "Đại học Kinh tế",
    major: "Quản trị Kinh doanh",
    totalScore: 24.0,
    status: "Approved"
  },
  {
    id: 3,
    fullName: "Lê Văn D",
    university: "Đại học Bách Khoa",
    major: "Kỹ thuật Máy tính",
    totalScore: 25.2,
    status: "Rejected"
  }
];
