import { Button, Card, Form, Input, message, Typography, Row, Col, Tabs } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { login, register } from "../../api/authApi";
import { setToken, setUser } from "../../utils/auth";

const { Title, Text } = Typography;

export default function CandidateAuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      if (isRegister) {
        const response = await register({
          username: values.username,
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          phone: values.phone
        });
        message.success("Đăng ký tài khoản thành công! Vui lòng đăng nhập.");
        setIsRegister(false);
        form.resetFields();
      } else {
        const response: any = await login({
          identifier: values.email_or_username, 
          password: values.password
        });

        if (response && response.token) {
          setToken(response.token);
          setUser(response.user);
          message.success("Đăng nhập hệ thống thành công.");

          // Token-based Auth: Tự động nhận diện quyền để chuyển hướng về đúng phân hệ trong module
          if (response.user?.role === "admin") {
            navigate("/admin/dashboard");
          } else {
            navigate("/student/dashboard");
          }
        }
      }
    } catch (error: any) {
      message.error(error.message || "Xác thực thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', backgroundColor: '#f8fafc', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      <Row style={{ width: '100%', height: '100%' }}>
        
        {/* NỬA TRÁI: Banner công nghệ trường học cực đẹp */}
        <Col xs={0} md={12} style={{
          position: 'relative',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '64px',
          color: '#ffffff'
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: "url('https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1000')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.15,
            zIndex: 1
          }} />
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '500px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <SafetyCertificateOutlined style={{ fontSize: '32px', color: '#38bdf8' }} />
              <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '1px', color: '#38bdf8' }}>PORTAL TUYỂN SINH GIÁO DỤC</span>
            </div>
            <Title level={1} style={{ color: '#fff', margin: '0 0 20px 0', fontSize: '36px', fontWeight: 800, lineHeight: 1.2 }}>
              Hệ thống Xét tuyển Học bạ Thông minh
            </Title>
            <Text style={{ color: '#94a3b8', fontSize: '16px', lineHeight: '1.6', display: 'block' }}>
              Ứng dụng nền tảng công nghệ số hóa quy trình nộp hồ sơ, tự động lọc nguyện vọng phân cấp và tối ưu hóa thời gian phê duyệt cho Hội đồng tuyển sinh.
            </Text>
          </div>
        </Col>

        {/* NỬA PHẢI: Form đăng nhập/đăng ký dạng CARD PHẲNG cao cấp */}
        <Col xs={24} md={12} style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', padding: '40px', backgroundColor: '#ffffff' }}>
          <div style={{ width: '100%', maxWidth: '420px' }}>
            <div style={{ marginBottom: '32px' }}>
              <Title level={2} style={{ margin: '0 0 8px 0', fontWeight: 700, color: '#1e293b' }}>
                {isRegister ? "Tạo tài khoản mới" : "Chào mừng trở lại"}
              </Title>
              <Text type="secondary" style={{ fontSize: '14px' }}>
                {isRegister ? "Đăng ký làm thí sinh để bắt đầu nộp hồ sơ xét tuyển học bạ" : "Dành cho cả Thí sinh và Quản trị viên hệ thống"}
              </Text>
            </div>

            <Tabs 
              activeKey={isRegister ? "register" : "login"} 
              onChange={(key) => { setIsRegister(key === "register"); form.resetFields(); }}
              style={{ marginBottom: '24px' }}
              items={[
                { key: "login", label: "ĐĂNG NHẬP HỆ THỐNG" },
                { key: "register", label: "ĐĂNG KÝ THÍ SINH" }
              ]}
            />

            <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
              {isRegister ? (
                <>
                  <Form.Item name="username" rules={[{ required: true, message: "Nhập tài khoản đăng nhập" }]}>
                    <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} placeholder="Tên tài khoản (Username)" size="large" style={{ borderRadius: '6px' }} />
                  </Form.Item>
                  <Form.Item name="fullName" rules={[{ required: true, message: "Nhập đầy đủ họ tên" }]}>
                    <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} placeholder="Họ và tên thí sinh" size="large" style={{ borderRadius: '6px' }} />
                  </Form.Item>
                  <Form.Item name="phone" rules={[{ required: true, message: "Nhập số điện thoại liên hệ" }]}>
                    <Input prefix={<PhoneOutlined style={{ color: '#94a3b8' }} />} placeholder="Số điện thoại di động" size="large" style={{ borderRadius: '6px' }} />
                  </Form.Item>
                  <Form.Item name="email" rules={[{ required: true, type: 'email', message: "Nhập đúng định dạng email" }]}>
                    <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} placeholder="Địa chỉ Email" size="large" style={{ borderRadius: '6px' }} />
                  </Form.Item>
                </>
              ) : (
                <Form.Item name="email_or_username" rules={[{ required: true, message: "Vui lòng nhập Email hoặc Tên tài khoản" }]}>
                  <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} placeholder="Email hoặc Tên tài khoản đăng nhập" size="large" style={{ borderRadius: '6px' }} />
                </Form.Item>
              )}

              <Form.Item name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}>
                <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="Mật khẩu bảo mật" size="large" style={{ borderRadius: '6px' }} />
              </Form.Item>

              <Form.Item style={{ marginTop: '32px' }}>
                <Button type="primary" htmlType="submit" block loading={loading} size="large" style={{ fontWeight: 600, height: '45px', backgroundColor: '#2563eb', borderRadius: '6px', border: 'none' }}>
                  {isRegister ? "Bắt đầu đăng ký" : "Đăng nhập ngay"}
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Col>

      </Row>
    </div>
  );
}