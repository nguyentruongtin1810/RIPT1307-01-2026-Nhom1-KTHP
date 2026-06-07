import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Col, Form, Input, Radio, Row, Tabs, Typography, notification } from "antd";
import { LockOutlined, UserOutlined, MailOutlined, PhoneOutlined, IdcardOutlined } from "@ant-design/icons";
import { login, register } from "../api/authApi";
import { setToken, setUser } from "../utils/auth";

const { Title, Text } = Typography;

export default function AuthContainer() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [loading, setLoading] = useState(false);
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const navigate = useNavigate();

  const handleLogin = async (values: any) => {
    setLoading(true);
    try {
      const response = await login({ emailOrUsername: values.identifier, password: values.password });
      
      if (response.user.role !== values.role) {
        notification.error({ message: "Đăng nhập thất bại", description: "Vai trò bạn chọn không khớp với tài khoản này." });
        setLoading(false);
        return;
      }

      setToken(response.token);
      setUser(response.user);
      notification.success({ message: "Đăng nhập thành công!" });
      if (values.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Sai tài khoản hoặc mật khẩu. Vui lòng thử lại.";
      notification.error({ message: "Đăng nhập thất bại", description: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        username: values.email
      };
      await register(payload);
      notification.success({
        message: "Đăng ký thành công!",
        description: "Vui lòng đăng nhập để tiếp tục."
      });
      registerForm.resetFields();
      setActiveTab("login");
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Đã có lỗi xảy ra trong quá trình đăng ký.";
      notification.error({ message: "Đăng ký thất bại", description: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    {
      key: "login",
      label: "Đăng nhập",
      children: (
        <Form form={loginForm} layout="vertical" onFinish={handleLogin} size="large" initialValues={{ role: "student" }}>
          <Form.Item name="identifier" rules={[{ required: true, message: "Vui lòng nhập email hoặc username!" }]}>
            <Input prefix={<UserOutlined />} placeholder="Email hoặc Username" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>
          <Form.Item name="role" rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}>
            <Radio.Group style={{ width: "100%" }}>
              <Radio.Button style={{ width: "50%", textAlign: "center" }} value="student">Thí sinh</Radio.Button>
              <Radio.Button style={{ width: "50%", textAlign: "center" }} value="admin">Admin</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading} style={{ borderRadius: 12 }}>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      )
    },
    {
      key: "register",
      label: "Đăng ký thí sinh",
      children: (
        <Form form={registerForm} layout="vertical" onFinish={handleRegister} size="large">
          <Form.Item name="fullName" rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}>
            <Input prefix={<IdcardOutlined />} placeholder="Họ và tên đầy đủ" />
          </Form.Item>
          <Form.Item name="email" rules={[{ required: true, message: "Vui lòng nhập email!" }, { type: "email", message: "Email không hợp lệ!" }]}>
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item name="phone" rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}>
            <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }, { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự." }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading} style={{ borderRadius: 12 }}>
              Đăng ký
            </Button>
          </Form.Item>
        </Form>
      )
    }
  ];

  return (
    <Row style={{ minHeight: "100vh" }}>
      <Col span={14} style={{ background: "linear-gradient(135deg, #1890ff 0%, #0050b3 100%)", color: "white", display: "flex", flexDirection: "column", justifyContent: "center", padding: "56px 64px" }}>
        <div style={{ maxWidth: 560 }}>
          <Title style={{ color: "white", fontSize: 48, lineHeight: 1.1, marginBottom: 24 }}>
            Cổng Thông Tin Tuyển Sinh
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.82)", fontSize: 18, lineHeight: 1.8 }}>
            Đăng nhập hoặc đăng ký thí sinh mới ngay bây giờ để quản lý hồ sơ, nộp xét tuyển và theo dõi tiến trình một cách trực quan và hiệu quả.
          </Text>
        </div>
      </Col>

      <Col span={10} style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f2f5" }}>
        <Card style={{ width: "100%", maxWidth: 420, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <Title level={3}>Hệ Thống Tuyển Sinh</Title>
            <Text type="secondary">Chuyển đổi nhanh giữa đăng nhập và đăng ký thí sinh.</Text>
          </div>

          <Tabs activeKey={activeTab} items={tabs} onChange={(key) => setActiveTab(key)} centered />
        </Card>
      </Col>
    </Row>
  );
}
