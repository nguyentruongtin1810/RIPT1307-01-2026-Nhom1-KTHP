import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  Button,
  Card,
  Cascader,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Select,
  Steps,
  Typography,
  Upload,
  Alert
} from "antd";
import type { UploadFile, UploadProps } from "antd/es/upload";
import { InboxOutlined } from "@ant-design/icons";
import { fetchUniversityData, getProfile, submitApplication } from "../../api/candidateApi";
import { getToken, getUserRole } from "../../utils/auth";

const { Title, Text } = Typography;
const { Step } = Steps;
const { Dragger } = Upload;

const scoreFieldsByGroup: Record<string, Array<{ name: string; label: string }>> = {
  A00: [
    { name: "math", label: "Toán" },
    { name: "physics", label: "Vật lý" },
    { name: "chemistry", label: "Hóa học" }
  ],
  A01: [
    { name: "math", label: "Toán" },
    { name: "physics", label: "Vật lý" },
    { name: "english", label: "Tiếng Anh" }
  ],
  D01: [
    { name: "math", label: "Toán" },
    { name: "literature", label: "Ngữ văn" },
    { name: "english", label: "Tiếng Anh" }
  ],
  C01: [
    { name: "literature", label: "Ngữ văn" },
    { name: "history", label: "Lịch sử" },
    { name: "geography", label: "Địa lý" }
  ],
  default: [
    { name: "math", label: "Toán" },
    { name: "literature", label: "Ngữ văn" },
    { name: "english", label: "Tiếng Anh" }
  ]
};

const priorityOptions = [
  { value: "None", label: "Không ưu tiên" },
  { value: "Priority 1", label: "Ưu tiên khu vực" },
  { value: "Priority 2", label: "Ưu tiên đối tượng" }
];

export default function ApplyPage() {
  const [form] = Form.useForm();
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [universityOptions, setUniversityOptions] = useState<any[]>([]);
  const [subjectGroupCode, setSubjectGroupCode] = useState<string>("");
  const [profileLoaded, setProfileLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!getToken() || getUserRole() !== "student") {
      navigate("/login");
      return;
    }

    async function loadResources() {
      try {
        const [options, profile] = await Promise.all([fetchUniversityData(), getProfile()]);
        setUniversityOptions(options);
        form.setFieldsValue({
          fullName: profile.fullName,
          phone: profile.phone,
          gender: profile.gender,
          dob: profile.dob ? dayjs(profile.dob) : null,
          idCardNumber: profile.idCardNumber,
          priority: profile.priorityGroup || "None"
        });
      } catch (error: any) {
        message.error("Không thể tải dữ liệu trường/ngành hoặc thông tin hồ sơ.");
      } finally {
        setProfileLoaded(true);
      }
    }

    loadResources();
  }, [form, navigate]);

  const scoreFields = useMemo(() => {
    const match = subjectGroupCode.match(/A00|A01|D01|C01/);
    const key = match?.[0] || "default";
    return scoreFieldsByGroup[key] || scoreFieldsByGroup.default;
  }, [subjectGroupCode]);

  const handleNext = async () => {
    const stepValidation = current === 0 ? ["fullName", "phone", "gender", "dob", "idCardNumber", "priority"] : ["universityPath"];
    if (current === 1) {
      await form.validateFields(stepValidation);
      if (!subjectGroupCode) {
        message.error("Vui lòng chọn tổ hợp xét tuyển.");
        return;
      }
    }

    await form.validateFields(stepValidation);
    setCurrent((prev) => prev + 1);
  };

  const handlePrev = () => setCurrent((prev) => Math.max(prev - 1, 0));

  const handleFinish = async () => {
    try {
      const values = await form.validateFields();
      const universityPath = values.universityPath || [];
      const [universityId, majorId, subjectGroupId] = universityPath;

      if (!universityId || !majorId || !subjectGroupId) {
        message.error("Vui lòng chọn trường, ngành và tổ hợp.");
        return;
      }

      if (!uploadFiles.length) {
        message.error("Vui lòng tải lên ít nhất một tài liệu.");
        return;
      }

      const scores = scoreFields.reduce((acc, field) => {
        acc[field.name] = Number(values[field.name] ?? 0);
        return acc;
      }, {} as Record<string, number>);

      const payload = {
        universityId,
        majorId,
        subjectGroupId,
        scores,
        priority: values.priority || "None",
        documents: uploadFiles.map((file) => ({
          name: file.name,
          type: file.type || "application/octet-stream",
          size: file.size || 0
        })),
        profile: {
          fullName: values.fullName,
          phone: values.phone,
          gender: values.gender,
          dob: values.dob ? values.dob.format("YYYY-MM-DD") : "",
          idCardNumber: values.idCardNumber,
          priorityGroup: values.priority || "None"
        }
      };

      setLoading(true);
      await submitApplication(payload);
      message.success("Hồ sơ của bạn đã được gửi thành công.");
      navigate("/student/status");
    } catch (error: any) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error("Lỗi gửi hồ sơ. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  const uploadProps: UploadProps<UploadFile> = {
    multiple: true,
    accept: "image/*,application/pdf",
    beforeUpload: (file) => {
      setUploadFiles((current) => [...current, file]);
      return false;
    },
    onRemove: (file) => {
      setUploadFiles((current) => current.filter((item) => item.uid !== file.uid));
    },
    fileList: uploadFiles.map((file, index) => ({
      uid: file.uid || `${file.name}-${index}`,
      name: file.name,
      status: "done" as const,
      size: file.size,
      type: file.type
    }))
  };

  return (
    <div className="page-shell">
      <Card className="page-card" title={<Title level={4} style={{ margin: 0 }}>Nộp hồ sơ xét tuyển</Title>} style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        {!profileLoaded ? (
          <div style={{ textAlign: "center", padding: 48 }}>
            <Text>Đang tải thông tin thí sinh và danh sách trường/ngành...</Text>
          </div>
        ) : (
          <>
            <Steps current={current} style={{ marginBottom: 32 }}>
              <Step title="Thông tin" description="Thông tin cá nhân" />
              <Step title="Lựa chọn" description="Trường, ngành, điểm" />
              <Step title="Tài liệu" description="Tải lên hồ sơ" />
            </Steps>

            <Form form={form} layout="vertical" size="large">
              {current === 0 && (
                <div style={{ padding: "0 16px" }}>
                  <Row gutter={[24, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}> 
                        <Input placeholder="Nguyễn Văn A" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}> 
                        <Input placeholder="0901 234 567" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[24, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item name="gender" label="Giới tính" rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}> 
                        <Select options={[{ value: "Nam", label: "Nam" }, { value: "Nữ", label: "Nữ" }, { value: "Khác", label: "Khác" }]} placeholder="Chọn giới tính" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="dob" label="Ngày sinh" rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}> 
                        <DatePicker style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[24, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item name="idCardNumber" label="Số CMND/CCCD" rules={[{ required: true, message: "Vui lòng nhập số CMND/CCCD" }]}> 
                        <Input placeholder="012345678" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="priority" label="Đối tượng ưu tiên" rules={[{ required: true, message: "Vui lòng chọn đối tượng ưu tiên" }]}> 
                        <Select options={priorityOptions} placeholder="Chọn ưu tiên" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Alert type="info" message="Bước 1: Kiểm tra lại thông tin cá nhân trước khi chuyển sang lựa chọn trường và tổ hợp." style={{ marginBottom: 24 }} />
                </div>
              )}

              {current === 1 && (
                <div style={{ padding: "0 16px" }}>
                  <Row gutter={[24, 16]}>
                    <Col xs={24} md={24}>
                      <Form.Item
                        name="universityPath"
                        label="Trường / Ngành / Tổ hợp"
                        rules={[{ required: true, message: "Vui lòng chọn trường, ngành và tổ hợp" }]}
                      >
                        <Cascader
                          options={universityOptions}
                          placeholder="Chọn trường, ngành và tổ hợp"
                          style={{ width: "100%" }}
                          onChange={(value, selectedOptions) => {
                            const code = (selectedOptions?.[selectedOptions.length - 1] as any)?.code || "";
                            setSubjectGroupCode(code);
                          }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[24, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item name="priority" label="Đối tượng ưu tiên">
                        <Select placeholder="Chọn ưu tiên" options={priorityOptions} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Title level={5} style={{ marginTop: 16, marginBottom: 16 }}>Điểm xét tuyển</Title>
                  <Row gutter={[24, 16]}>
                    {scoreFields.map((field) => (
                      <Col xs={24} md={12} lg={8} key={field.name}>
                        <Form.Item name={field.name} label={field.label} rules={[{ required: true, message: `Vui lòng nhập điểm ${field.label}` }]}> 
                          <InputNumber style={{ width: "100%" }} min={0} max={10} step={0.1} />
                        </Form.Item>
                      </Col>
                    ))}
                  </Row>

                  <Alert type="warning" message={`Tổ hợp hiện tại: ${subjectGroupCode || "Chưa chọn"}`} style={{ marginBottom: 24 }} />
                </div>
              )}

              {current === 2 && (
                <div style={{ padding: "0 16px" }}>
                  <Form.Item label="Tải lên giấy tờ" required>
                    <Dragger {...uploadProps} style={{ padding: 32, background: "#fafafa", borderRadius: 12 }}>
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined style={{ color: "#1890ff" }} />
                      </p>
                      <p className="ant-upload-text" style={{ fontSize: 16, fontWeight: 500 }}>Kéo thả tệp vào đây hoặc nhấp để tải lên</p>
                      <p className="ant-upload-hint" style={{ color: "rgba(0,0,0,0.45)" }}>Hỗ trợ JPG, PNG, PDF. Tối đa 5 tài liệu.</p>
                    </Dragger>
                  </Form.Item>
                  <Text type="secondary">Bạn nên tải lên ít nhất CMND/CCCD và bằng tốt nghiệp hoặc học bạ.</Text>
                </div>
              )}

              <Row justify="space-between" style={{ marginTop: 40, padding: "0 16px" }}>
                <Col>
                  {current > 0 && (
                    <Button size="large" onClick={handlePrev} style={{ borderRadius: 12 }}>
                      Quay lại
                    </Button>
                  )}
                </Col>
                <Col>
                  {current < 2 && (
                    <Button type="primary" size="large" onClick={handleNext} style={{ borderRadius: 12 }}>
                      Tiếp theo
                    </Button>
                  )}
                  {current === 2 && (
                    <Button type="primary" size="large" loading={loading} onClick={handleFinish} style={{ borderRadius: 12 }}>
                      Gửi hồ sơ
                    </Button>
                  )}
                </Col>
              </Row>
            </Form>
          </>
        )}
      </Card>
    </div>
  );
}
