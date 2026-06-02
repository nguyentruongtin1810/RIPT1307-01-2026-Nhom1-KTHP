import { Button, Card, Cascader, DatePicker, Form, Input, InputNumber, Select, Row, Col, Upload, message, Typography } from "antd";
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
    // Bảo vệ tuyến đường (Route Guard)
    if (!getToken() || getUserRole() !== "student") {
      navigate("/candidate/login");
      return;
    }

    async function loadOptions() {
      try {
        const data = await fetchUniversityData();
        setUniversityOptions(data);
      } catch (error: any) {
        message.error("Không thể tải dữ liệu trường/ngành từ hệ thống.");
      }
    }

    loadOptions();
  }, [navigate]);

  const onFinish = async (values: any) => {
    const [universityId, majorId, subjectGroupId] = values.universityPath || [];
    if (!universityId || !majorId || !subjectGroupId) {
      message.error("Vui lòng chọn đầy đủ thông tin trường, ngành và tổ hợp xét tuyển.");
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
      message.success("Hồ sơ xét tuyển của bạn đã được gửi thành công.");
      // Điều hướng về đúng tuyến đường thuộc StudentLayout
      navigate("/student/tracking");
    } catch (error: any) {
      // Đón nhận trực tiếp message đã qua xử lý từ interceptor của axiosConfig
      message.error(error.message || "Lỗi gửi hồ sơ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    beforeUpload: (file: File) => {
      if (fileList.length >= 3) {
        message.error("Chỉ được tải lên tối đa 3 tài liệu minh chứng.");
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
    <div style={{ padding: '4px' }}>
      <Card 
        bordered={false} 
        style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        title={<Title level={4} style={{ margin: 0, color: '#1f1f1f' }}>Đăng Ký Xét Tuyển Trực Tuyến</Title>}
      >
        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          
          {/* KHỐI 1: THÔNG TIN CÁ NHÂN */}
          <Title level={5} style={{ marginBottom: '16px', color: '#434343', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>
            1. Thông tin cá nhân thí sinh
          </Title>
          
          <Row gutter={16}>
            <Col xs={24} sm={16}>
              <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}>
                <Input placeholder="Nguyễn Văn A" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="dob" label="Ngày sinh" rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}>
                <DatePicker style={{ width: "100%" }} size="large" format="DD/MM/YYYY" placeholder="Chọn ngày" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="email" label="Địa chỉ Email" rules={[{ required: true, message: "Vui lòng nhập email" }, { type: "email", message: "Email không đúng định dạng" }]}>
                <Input placeholder="email@example.com" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="phone" label="Số điện thoại liên hệ" rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}>
                <Input placeholder="09xx xxx xxx" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="Địa chỉ thường trú" rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}>
            <TextArea rows={2} placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố..." />
          </Form.Item>

          {/* KHỐI 2: ĐIỂM XÉT TUYỂN & NGUYỆN VỌNG */}
          <Title level={5} style={{ margin: '24px 0 16px 0', color: '#434343', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>
            2. Thông tin kết quả học tập & Nguyện vọng xét tuyển
          </Title>
          
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="scoreMath" label="Điểm môn Toán" rules={[{ required: true, message: "Nhập điểm Toán" }]}>
                <InputNumber style={{ width: "100%" }} min={0} max={10} step={0.01} placeholder="0.00" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="scoreLiterature" label="Điểm môn Ngữ văn" rules={[{ required: true, message: "Nhập điểm Văn" }]}>
                <InputNumber style={{ width: "100%" }} min={0} max={10} step={0.01} placeholder="0.00" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="scoreEnglish" label="Điểm môn Tiếng Anh" rules={[{ required: true, message: "Nhập điểm Anh" }]}>
                <InputNumber style={{ width: "100%" }} min={0} max={10} step={0.01} placeholder="0.00" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={10}>
              <Form.Item name="priority" label="Đối tượng ưu tiên xét tuyển" rules={[{ required: true, message: "Vui lòng chọn đối tượng ưu tiên" }]}>
                <Select options={priorityOptions} placeholder="Chọn đối tượng ưu tiên" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={14}>
              <Form.Item name="universityPath" label="Lựa chọn Nguyện vọng (Trường / Ngành / Tổ hợp)" rules={[{ required: true, message: "Vui lòng cấu hình lộ trình nguyện vọng" }]}>
                <Cascader
                  options={universityOptions}
                  placeholder="Bấm để chọn thứ tự Trường > Ngành > Tổ hợp môn"
                  style={{ width: "100%" }}
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* KHỐI 3: MINH CHỨNG TÀI LIỆU */}
          <Title level={5} style={{ margin: '24px 0 16px 0', color: '#434343', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>
            3. Đính kèm tệp tin minh chứng
          </Title>
          
          <Form.Item label="Tải lên tài liệu số (Học bạ THPT, CCCD hoặc chứng nhận ưu tiên nếu có)" help="Hệ thống hỗ trợ định dạng ảnh, pdf. Tối đa 3 tệp tin.">
            <Upload {...uploadProps} multiple>
              <Button icon={<UploadOutlined />} size="large">Chọn tài liệu từ thiết bị</Button>
            </Upload>
          </Form.Item>

          {/* NÚT SUBMIT */}
          <Form.Item style={{ marginTop: '32px', marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block loading={loading} size="large" style={{ height: '44px', fontSize: '16px', fontWeight: 500 }}>
              Xác nhận & Gửi hồ sơ xét tuyển
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}