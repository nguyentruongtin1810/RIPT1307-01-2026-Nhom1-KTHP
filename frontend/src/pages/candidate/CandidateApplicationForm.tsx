import { Button, Card, Cascader, DatePicker, Form, Input, InputNumber, Select, Space, Upload, message, Typography } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUniversityData, submitApplication } from "../../api/candidateApi";
import { getToken, getUserRole } from "../../utils/auth";
import { priorityOptions } from "../../data/mockData";

const { Title } = Typography;
const { TextArea } = Input;

export default function CandidateApplicationForm() {
  const [fileList, setFileList] = useState<any[]>([]);
  const [universityOptions, setUniversityOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!getToken() || getUserRole() !== "student") {
      navigate("/candidate/login");
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

  const onFinish = async (values: any) => {
    const [universityId, majorId, subjectGroupId] = values.universityPath || [];
    if (!universityId || !majorId || !subjectGroupId) {
      message.error("Vui lòng chọn trường, ngành và tổ hợp.");
      return;
    }

    const payload = {
      universityId,
      majorId,
      subjectGroupId,
      scoreMath: values.scoreMath,
      scoreLiterature: values.scoreLiterature,
      scoreEnglish: values.scoreEnglish,
      priority: values.priority,
      documents: fileList.map((file) => ({ name: file.name, type: file.type, size: file.size }))
    };

    setLoading(true);
    try {
      await submitApplication(payload);
      message.success("Hồ sơ của bạn đã được gửi thành công.");
      navigate("/candidate/tracking");
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

  const uploadProps = {
    beforeUpload: (file: File) => {
      if (fileList.length >= 3) {
        message.error("Chỉ được tải tối đa 3 tài liệu.");
        return Upload.LIST_IGNORE;
      }
      setFileList((current) => [...current, file]);
      return false;
    },
    onRemove: (file: any) => {
      setFileList((current) => current.filter((item) => item.uid !== file.uid));
    },
    fileList
  };

  return (
    <div className="page-shell">
      <Card className="page-card" title={<Title level={4}>Đăng ký xét tuyển</Title>}>
        <Form layout="vertical" onFinish={onFinish}>
          <Title level={5}>Thông tin cá nhân</Title>
          <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>

          <Form.Item name="dob" label="Ngày sinh" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="email" label="Email" rules={[{ required: true }, { type: "email" }]}>
            <Input placeholder="email@example.com" />
          </Form.Item>

          <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}>
            <Input placeholder="09xx xxx xxx" />
          </Form.Item>

          <Form.Item name="address" label="Địa chỉ" rules={[{ required: true }]}>
            <TextArea rows={3} placeholder="Địa chỉ thường trú" />
          </Form.Item>

          <Title level={5}>Điểm xét tuyển</Title>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Form.Item name="scoreMath" label="Toán" rules={[{ required: true }]}>
              <InputNumber style={{ width: "100%" }} min={0} max={10} step={0.1} />
            </Form.Item>
            <Form.Item name="scoreLiterature" label="Ngữ văn" rules={[{ required: true }]}>
              <InputNumber style={{ width: "100%" }} min={0} max={10} step={0.1} />
            </Form.Item>
            <Form.Item name="scoreEnglish" label="Tiếng Anh" rules={[{ required: true }]}>
              <InputNumber style={{ width: "100%" }} min={0} max={10} step={0.1} />
            </Form.Item>
          </Space>

          <Form.Item name="priority" label="Đối tượng ưu tiên" rules={[{ required: true }]}>
            <Select options={priorityOptions} placeholder="Chọn đối tượng ưu tiên" />
          </Form.Item>

          <Form.Item name="universityPath" label="Trường / Ngành / Tổ hợp" rules={[{ required: true }]}>
            <Cascader
              options={universityOptions}
              placeholder="Chọn trường, ngành, tổ hợp"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item label="Tải lên hồ sơ" help="ID card, học bạ, giấy tờ liên quan">
            <Upload {...uploadProps} multiple>
              <Button icon={<UploadOutlined />}>Chọn tài liệu</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Gửi hồ sơ
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
