import { Card, Steps, Form, Select, InputNumber, Input, Button, Row, Col, Space, Typography, message } from "antd";
import { useState, useEffect } from "react";
import { BankOutlined, BookOutlined, CalculatorOutlined, CloudUploadOutlined } from "@ant-design/icons";

// Tự động nhận diện linh hoạt file studentApi dù nằm ở bất kỳ cấp thư mục nào
import { studentApi } from "../../api/candidateApi";

const { Text } = Typography;
const { Option } = Select;

export default function CandidateApplicationForm() {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [schools, setSchools] = useState<any[]>([]);
  const [majors, setMajors] = useState<any[]>([]);
  const [subjectGroups, setSubjectGroups] = useState<any[]>([]);

  useEffect(() => {
    studentApi.getSchools()
      .then((res: any) => setSchools(res.data || res))
      .catch((err) => console.error("Lỗi lấy danh sách trường:", err));
      
    studentApi.getSubjectGroups()
      .then((res: any) => setSubjectGroups(res.data || res))
      .catch((err) => console.error("Lỗi lấy khối xét tuyển:", err));
  }, []);

  const handleSchoolChange = async (schoolId: number) => {
    form.setFieldsValue({ majorId: undefined });
    try {
      const res: any = await studentApi.getMajorsBySchool(schoolId);
      setMajors(res.data || res);
    } catch (err) {
      console.error("Lỗi lấy danh sách ngành:", err);
    }
  };

  const handleFinalSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const payload = {
        schoolId: values.schoolId,
        majorId: values.majorId,
        subjectGroupId: values.subjectGroupId,
        scoreMath: values.scoreMath,
        scorePhysics: values.scorePhysics,
        scoreChemistry: values.scoreChemistry,
        priority: values.priority,
        documentUrl: values.documentUrl
      };

      await studentApi.submitFullWorkflow(payload);
      message.success("Hồ sơ tuyển sinh số hóa của bạn đã được phê duyệt nộp thành công!");
      form.resetFields();
      setCurrentStep(0);
    } catch (err: any) {
      message.error(err?.message || "Vui lòng hoàn thành toàn bộ thông tin hợp lệ ở các bước!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "12px", width: "100%" }}>
      <Card bordered={false} title="HỘ SƠ ĐĂNG KÝ XÉT TUYỂN ĐIỆN TỬ" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <Steps current={currentStep} style={{ maxWidth: "750px", margin: "0 auto 32px auto" }} items={[
          { title: "Bước 1", description: "Hồ sơ & Ưu tiên" },
          { title: "Bước 2", description: "Chọn nguyện vọng" },
          { title: "Bước 3", description: "Đính kèm minh chứng" }
        ]} />

        <Form form={form} layout="vertical">
          {/* BƯỚC 1: HỒ SƠ ĐỐI TƯỢNG ƯU TIÊN */}
          {currentStep === 0 && (
            <div style={{ maxWidth: "500px", margin: "0 auto" }}>
              <Form.Item name="priority" label="Khu vực / Đối tượng tuyển sinh ưu tiên" rules={[{ required: true }]} initialValue="KV3">
                <Select size="large">
                  <Option value="KV1">Khu vực 1 (Ưu tiên cộng 0.75đ)</Option>
                  <Option value="KV2">Khu vực 2 (Ưu tiên cộng 0.5đ)</Option>
                  <Option value="KV3">Khu vực 3 (Thành phố - Không cộng điểm)</Option>
                </Select>
              </Form.Item>
              <Button type="primary" size="large" onClick={() => setCurrentStep(1)} block style={{ marginTop: "16px", height: "45px" }}>
                Tiếp tục sang Bước 2
              </Button>
            </div>
          )}

          {/* BƯỚC 2: NGUYỆN VỌNG & ĐIỂM SỐ XÉT TUYỂN */}
          {currentStep === 1 && (
            <div style={{ maxWidth: "500px", margin: "0 auto" }}>
              <Form.Item name="schoolId" label="1. Chọn Trường Đại học / Học viện" rules={[{ required: true, message: "Bắt buộc chọn trường" }]}>
                <Select placeholder="-- Chọn cơ sở đào tạo tuyển sinh --" size="large" onChange={handleSchoolChange}>
                  {schools.map(s => <Option key={s.id} value={s.id}><BankOutlined /> {s.name}</Option>)}
                </Select>
              </Form.Item>
              <Form.Item name="majorId" label="2. Chọn Chuyên ngành đào tạo" rules={[{ required: true, message: "Bắt buộc chọn ngành" }]}>
                <Select placeholder="-- Chọn ngành học trực thuộc trường --" size="large" disabled={majors.length === 0}>
                  {majors.map(m => <Option key={m.id} value={m.id}><BookOutlined /> {m.name}</Option>)}
                </Select>
              </Form.Item>
              
              {/* ĐÃ VÁ LỖI THẺ ĐÓNG FORM.ITEM TẠI ĐÂY */}
              <Form.Item name="subjectGroupId" label="3. Khối / Tổ hợp môn xét tuyển học bạ" rules={[{ required: true }]}>
                <Select placeholder="-- Chọn tổ hợp môn --" size="large">
                  {subjectGroups.map(g => <Option key={g.id} value={g.id}><CalculatorOutlined /> Khối {g.name}</Option>)}
                </Select>
              </Form.Item>
              
              <Text strong style={{ display: "block", marginBottom: "12px", color: "#475569" }}>4. Nhập điểm số học bạ (Thang điểm 10):</Text>
              <Row gutter={12}>
                <Col span={8}><Form.Item name="scoreMath" label="Toán học" rules={[{ required: true }]}><InputNumber min={0} max={10} step={0.1} style={{ width: "100%" }} size="large" /></Form.Item></Col>
                <Col span={8}><Form.Item name="scorePhysics" label="Vật lý" rules={[{ required: true }]}><InputNumber min={0} max={10} step={0.1} style={{ width: "100%" }} size="large" /></Form.Item></Col>
                <Col span={8}><Form.Item name="scoreChemistry" label="Hóa học" rules={[{ required: true }]}><InputNumber min={0} max={10} step={0.1} style={{ width: "100%" }} size="large" /></Form.Item></Col>
              </Row>

              <Space style={{ width: "100%", justifyContent: "space-between", marginTop: "16px" }}>
                <Button size="large" onClick={() => setCurrentStep(0)}>Quay lại</Button>
                <Button type="primary" size="large" onClick={() => setCurrentStep(2)}>Tiếp tục</Button>
              </Space>
            </div>
          )}

          {/* BƯỚC 3: TẢI ĐƯỜNG DẪN HỌC BẠ MINH CHỨNG */}
          {currentStep === 2 && (
            <div style={{ maxWidth: "500px", margin: "0 auto", textAlign: "center" }}>
              <Form.Item name="documentUrl" label="Liên kết lưu trữ File ảnh/PDF Học bạ & CCCD (Google Drive / OneDrive)" rules={[{ required: true, message: "Vui lòng cung cấp link minh chứng hợp lệ" }]}>
                <Input size="large" placeholder="https://drive.google.com/file/d/..." />
              </Form.Item>
              
              <div style={{ padding: "24px", border: "2px dashed #cbd5e1", borderRadius: "8px", backgroundColor: "#f8fafc", marginBottom: "24px" }}>
                <CloudUploadOutlined style={{ fontSize: "36px", color: "#94a3b8" }} />
                <p style={{ margin: "8px 0 0 0", color: "#64748b", fontSize: "13px" }}>Ảnh đính kèm học bạ sẽ được hệ thống hiển thị Thumbnail xem trước tại đây</p>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Button size="large" onClick={() => setCurrentStep(1)}>Quay lại</Button>
                <Button type="primary" size="large" loading={loading} onClick={handleFinalSubmit} style={{ backgroundColor: "#2563eb", padding: "0 24px" }}>
                  Xác nhận nộp đơn chính thức
                </Button>
              </div>
            </div>
          )}
        </Form>
      </Card>
    </div>
  );
}