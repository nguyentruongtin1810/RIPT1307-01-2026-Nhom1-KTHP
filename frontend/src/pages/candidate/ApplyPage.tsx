import { Button, Card, Cascader, Col, DatePicker, Form, Input, InputNumber, message, Row, Select, Steps, Typography, Upload } from "antd";
import type { UploadFile, UploadProps } from "antd/es/upload";
import { InboxOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUniversityData, submitApplication } from "../../api/candidateApi";
import { getToken, getUserRole } from "../../utils/auth";

const { Title, Text } = Typography;
const { Step } = Steps;
const { Dragger } = Upload;

const scoreFieldsByGroup: Record<string, Array<{ name: string; label: string }>> = {
  A00: [
    { name: "scoreMath", label: "Toán" },
    { name: "scorePhysics", label: "Vật lý" },
    { name: "scoreChemistry", label: "Hóa học" }
  ],
  A01: [
    { name: "scoreMath", label: "Toán" },
    { name: "scorePhysics", label: "Vật lý" },
    { name: "scoreEnglish", label: "Tiếng Anh" }
  ],
  D01: [
    { name: "scoreMath", label: "Toán" },
    { name: "scoreLiterature", label: "Ngữ văn" },
    { name: "scoreEnglish", label: "Tiếng Anh" }
  ],
  C01: [
    { name: "scoreLiterature", label: "Ngữ văn" },
    { name: "scoreHistory", label: "Lịch sử" },
    { name: "scoreGeography", label: "Địa lý" }
  ],
  default: [
    { name: "scoreMath", label: "Toán" },
    { name: "scoreLiterature", label: "Ngữ văn" },
    { name: "scoreEnglish", label: "Tiếng Anh" }
  ]
};

const stepFields = [
  ["fullName", "phone", "idCard", "dob"],
  ["universityPath", "priority", "scoreMath", "scoreLiterature", "scoreEnglish", "scorePhysics", "scoreChemistry", "scoreHistory", "scoreGeography"],
  []
];

export default function ApplyPage() {
  const [form] = Form.useForm();
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile<any>[]>([]);
  const [universityOptions, setUniversityOptions] = useState<any[]>([]);
  const [subjectGroupLabel, setSubjectGroupLabel] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!getToken() || getUserRole() !== "student") {
      navigate("/login");
      return;
    }

    async function loadOptions() {
      try {
        const data = await fetchUniversityData();
        setUniversityOptions(data);
      } catch (error: any) {
        message.error("Không thể tải dữ liệu trường/ngành.");
      }
    }

    loadOptions();
  }, [navigate]);

  const scoreFields = useMemo(() => {
    const match = subjectGroupLabel.match(/A00|A01|D01|C01/);
    const key = match?.[0] || "default";
    return scoreFieldsByGroup[key] || scoreFieldsByGroup.default;
  }, [subjectGroupLabel]);

  const handleStepValidate = async () => {
    const fields = stepFields[current].filter((name) => !name.startsWith("score") || scoreFields.some((field) => field.name === name));
    await form.validateFields(fields);
    setCurrent((prev) => prev + 1);
  };

  const handlePrev = () => setCurrent((prev) => Math.max(prev - 1, 0));

  const handleFinish = async () => {
    try {
      const activeScoreFields = scoreFields.map((field) => field.name);
      await form.validateFields([...stepFields[0], "universityPath", ...activeScoreFields]);

      if (!uploadFiles.length) {
        message.error("Vui lòng tải lên ít nhất một tài liệu.");
        return;
      }

      const values = form.getFieldsValue();
      const [universityId, majorId, subjectGroupId] = values.universityPath || [];
      if (!universityId || !majorId || !subjectGroupId) {
        message.error("Vui lòng chọn trường, ngành và tổ hợp.");
        return;
      }

      const payload = {
        universityId,
        majorId,
        subjectGroupId,
        scoreMath: values.scoreMath ?? 0,
        scoreLiterature: values.scoreLiterature ?? 0,
        scoreEnglish: values.scoreEnglish ?? 0,
        scorePhysics: values.scorePhysics ?? 0,
        scoreChemistry: values.scoreChemistry ?? 0,
        scoreHistory: values.scoreHistory ?? 0,
        scoreGeography: values.scoreGeography ?? 0,
        priority: values.priority || "None",
        documents: uploadFiles.map((file) => ({
          name: file.name,
          type: file.type || "application/octet-stream",
          size: file.size || 0
        }))
      };

      setLoading(true);
      await submitApplication(payload);
      message.success("Hồ sơ của bạn đã được gửi thành công.");
      navigate("/student/status");
    } catch (error: any) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (error.errorFields) {
        // validation failure, ignore because form will display errors
      } else {
        message.error("Lỗi gửi hồ sơ. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  const uploadProps: UploadProps<UploadFile<any>> = {
    multiple: true,
    accept: "image/*,application/pdf",
    beforeUpload: (file: UploadFile<any>) => {
      setUploadFiles((current) => [...current, file]);
      return false;
    },
    onRemove: (file: UploadFile<any>) => {
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
      <Card className="page-card" title={<Title level={4}>Nộp hồ sơ xét tuyển</Title>}>
        <Steps current={current} style={{ marginBottom: 32 }}>
          <Step title="Thông tin" description="Thông tin cá nhân" />
          <Step title="Lựa chọn" description="Chọn trường, ngành và điểm" />
          <Step title="Tài liệu" description="Tải lên giấy tờ" />
        </Steps>

        <Form form={form} layout="vertical">
          {current === 0 && (
            <>
              <Row gutter={16}>
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

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="idCard" label="Số CMND/CCCD" rules={[{ required: true, message: "Vui lòng nhập số CMND/CCCD" }]}> 
                    <Input placeholder="012345678" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="dob" label="Ngày sinh" rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}> 
                    <DatePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}

          {current === 1 && (
            <>
              <Row gutter={16}>
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
                        const label = selectedOptions[selectedOptions.length - 1]?.label?.toString() || "";
                        setSubjectGroupLabel(label);
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="priority" label="Đối tượng ưu tiên">
                    <Select placeholder="Chọn ưu tiên" options={[{ value: "None", label: "Không" }, { value: "Priority 1", label: "Priority 1" }, { value: "Priority 2", label: "Priority 2" }]} />
                  </Form.Item>
                </Col>
              </Row>

              <Text strong>Điểm xét tuyển</Text>
              <Row gutter={16} style={{ marginTop: 8 }}>
                {scoreFields.map((field) => (
                  <Col xs={24} md={12} lg={8} key={field.name}>
                    <Form.Item
                      name={field.name}
                      label={field.label}
                      rules={[{ required: true, message: `Vui lòng nhập điểm ${field.label}` }]}
                    >
                      <InputNumber style={{ width: "100%" }} min={0} max={10} step={0.1} />
                    </Form.Item>
                  </Col>
                ))}
              </Row>
            </>
          )}

          {current === 2 && (
            <>
              <Form.Item label="Tải lên giấy tờ" required>
                <Dragger {...uploadProps} style={{ padding: 24 }}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">Kéo thả tệp vào đây hoặc nhấp để tải lên</p>
                  <p className="ant-upload-hint">Hỗ trợ JPG, PNG, PDF. Tối đa 5 tài liệu.</p>
                </Dragger>
              </Form.Item>
              <Text type="secondary">Bạn nên tải lên ít nhất CMND/CCCD và học bạ để hoàn tất hồ sơ.</Text>
            </>
          )}

          <Row justify="space-between" style={{ marginTop: 32 }}>
            <Col>
              {current > 0 && (
                <Button onClick={handlePrev} style={{ marginRight: 12 }}>
                  Quay lại
                </Button>
              )}
            </Col>
            <Col>
              {current < 2 && (
                <Button type="primary" onClick={handleStepValidate}>
                  Tiếp theo
                </Button>
              )}
              {current === 2 && (
                <Button type="primary" loading={loading} onClick={handleFinish}>
                  Gửi hồ sơ
                </Button>
              )}
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
}
