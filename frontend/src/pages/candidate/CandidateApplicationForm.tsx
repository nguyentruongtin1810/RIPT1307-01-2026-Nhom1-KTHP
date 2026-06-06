import React, { useState, useEffect } from 'react';
import { 
  Steps, Form, Input, Select, Button, Upload, message, 
  Card, Row, Col, Typography, Divider, Spin 
} from 'antd';
import { 
  UserOutlined, BookOutlined, UploadOutlined, 
  ArrowLeftOutlined, ArrowRightOutlined, CloudUploadOutlined 
} from '@ant-design/icons';
import { candidateApi } from '../../api/candidateApi';

const { Step } = Steps;
const { Title, Text } = Typography;
const { Option } = Select;

const CandidateApplicationForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [universities, setUniversities] = useState<any[]>([]);
  const [majors, setMajors] = useState<any[]>([]);
  const [subjectGroups, setSubjectGroups] = useState<any[]>([]);
  const [selectedUniId, setSelectedUniId] = useState<number | null>(null);
  const [fileList, setFileList] = useState<any[]>([]);

  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
  try {
    const unis =
      await candidateApi.getUniversities();

    setUniversities(unis || []);
  } catch (error) {
    message.error(
      "Không thể tải dữ liệu. Vui lòng thử lại!"
    );
  }
};

  const handleUniversityChange = async (uniId: number) => {
    setSelectedUniId(uniId);
    form.setFieldValue('majorId', null);
    try {
      const data = await candidateApi.getMajorsByUniversity(uniId);
      setMajors(
  data.majors || []
);
    } catch (error) {
      message.error("Không tải được danh sách ngành học");
    }
  };
  const handleMajorChange = async (
  majorId: number
) => {
  try {
    const data =
      await candidateApi.getSubjectGroupsByMajor(
        majorId
      );

    setSubjectGroups(
      data.subjectGroups || []
    );
  } catch (error) {
    message.error(
      "Không tải được tổ hợp môn"
    );
  }
};

  const next = () => {
    form.validateFields().then(() => setCurrentStep(currentStep + 1)).catch(() => {});
  };

  const prev = () => setCurrentStep(currentStep - 1);

  const handleSubmit = async (values: any) => {
    if (fileList.length === 0) {
      message.warning("Vui lòng upload ít nhất một tài liệu!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
  universityId: values.universityId,

  majorId: values.majorId,

  subjectGroupId: values.subjectGroupId,

  score1: Number(values.score1),

  score2: Number(values.score2),

  score3: Number(values.score3),

  documentUrl: fileList[0]?.name || ""
};

      await candidateApi.submitApplication(payload);

      message.success("🎉 Nộp hồ sơ thành công! Hồ sơ của bạn đang được xét duyệt.");
      form.resetFields();
      setCurrentStep(0);
      setFileList([]);
    } catch (error: any) {
      message.error(error.message || "Nộp hồ sơ thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: 'Thông tin cá nhân',
      icon: <UserOutlined />,
      content: (
        <Form
  form={form}
  layout="vertical"
  onFinish={handleSubmit}
>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="fullName" label="Họ và tên thí sinh" rules={[{ required: true }]}>
                <Input size="large" placeholder="Nhập họ và tên đầy đủ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priorityGroup" label="Đối tượng ưu tiên">
                <Select size="large" placeholder="Chọn đối tượng ưu tiên (nếu có)">
                  <Option value="Priority 1">Ưu tiên 1 (Con thương binh, con liệt sĩ...)</Option>
                  <Option value="Priority 2">Ưu tiên 2 (Vùng sâu, vùng xa...)</Option>
                  <Option value="None">Không có đối tượng ưu tiên</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )
    },
    {
      title: 'Nguyện vọng & Điểm thi',
      icon: <BookOutlined />,
      content: (
        <Form form={form} layout="vertical">
          <Form.Item name="universityId" label="Chọn Trường Đại học" rules={[{ required: true }]}>
            <Select size="large" placeholder="Chọn trường" onChange={handleUniversityChange}>
              {universities.map((u: any) => (
                <Option key={u.id} value={u.id}>{u.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="majorId" label="Chọn Ngành học" rules={[{ required: true }]}>
            <Select
  size="large"
  placeholder="Chọn ngành"
  disabled={!selectedUniId}
  onChange={handleMajorChange}
>
              {majors.map((m: any) => (
                <Option key={m.id} value={m.id}>{m.name} ({m.code})</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="subjectGroupId" label="Tổ hợp xét tuyển" rules={[{ required: true }]}>
            <Select size="large" placeholder="Chọn tổ hợp môn">
              {subjectGroups.map((g: any) => (
                <Option key={g.id} value={g.id}>{g.code} - {g.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Divider orientation="left">Nhập điểm thi (thang 10)</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="score1" label="Môn 1" rules={[{ required: true }]}>
                <Input type="number" min={0} max={10} step="0.25" size="large" placeholder="Toán" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="score2" label="Môn 2" rules={[{ required: true }]}>
                <Input type="number" min={0} max={10} step="0.25" size="large" placeholder="Văn / Lý" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="score3" label="Môn 3" rules={[{ required: true }]}>
                <Input type="number" min={0} max={10} step="0.25" size="large" placeholder="Anh / Hóa" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )
    },
    {
      title: 'Tài liệu minh chứng',
      icon: <UploadOutlined />,
      content: (
        <Form form={form} layout="vertical">
          <Card>
            <Upload 
              listType="picture-card"
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList: newList }) => setFileList(newList)}
              maxCount={2}
            >
              {fileList.length >= 2 ? null : (
                <div>
                  <CloudUploadOutlined style={{ fontSize: 32 }} />
                  <div style={{ marginTop: 8 }}>Upload Học bạ & CCCD</div>
                </div>
              )}
            </Upload>
            <Text type="secondary" style={{ display: 'block', marginTop: 12 }}>
              Hỗ trợ: PDF, JPG, PNG (Tối đa 2 file)
            </Text>
          </Card>
        </Form>
      )
    }
  ];

  return (
    <Card style={{ minHeight: '85vh', borderRadius: 12 }} bordered={false}>
      <Title level={3} style={{ textAlign: 'center', marginBottom: 40 }}>
        Nộp Hồ Sơ Xét Tuyển Học Bạ
      </Title>

      <Steps current={currentStep} style={{ marginBottom: 40 }} size="default">
        {steps.map((item, i) => (
          <Step key={i} title={item.title} icon={item.icon} />
        ))}
      </Steps>

      <div style={{ minHeight: 420, padding: '0 20px' }}>
        {steps[currentStep].content}
      </div>

      <Divider />

      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px' }}>
        <Button 
          size="large" 
          onClick={prev} 
          disabled={currentStep === 0}
          icon={<ArrowLeftOutlined />}
        >
          Quay lại
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button type="primary" size="large" onClick={next} icon={<ArrowRightOutlined />}>
            Tiếp theo
          </Button>
        ) : (
          <Button 
            type="primary" 
            size="large" 
            loading={loading}
            onClick={() => form.submit()}
            style={{ height: 48, fontSize: 16 }}
          >
            📤 NỘP HỒ SƠ XÉT TUYỂN
          </Button>
        )}
      </div>
    </Card>
  );
};

export default CandidateApplicationForm;