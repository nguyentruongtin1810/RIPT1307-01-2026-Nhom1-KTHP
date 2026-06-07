import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Form, Input, Radio, Tabs, Typography, notification, Space } from "antd";
import { login, register } from "../api/authApi";
import { setToken, setUser } from "../utils/auth";

const { Title, Text } = Typography;

export default function AuthContainer() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"student" | "admin">("student");
  const navigate = useNavigate();

  const handleLogin = async (values: any) => {
    setLoading(true);
    try {
      const response = await login({ emailOrUsername: values.email, password: values.password });
      setToken(response.token);
      setUser(response.user);
      notification.success({ message: "Đăng nhập thành công", description: `Xin chào ${response.user.fullName}` });
      if (response.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (error: any) {
      notification.error({ message: "Đăng nhập thất bại", description: error.response?.data?.message || "Vui lòng kiểm tra lại thông tin." });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: any) => {
    setLoading(true);
    try {
      const response = await register({ email: values.email, password: values.password, fullName: values.fullName });
      setToken(response.token);
      setUser(response.user);
      notification.success({ message: "Đăng ký thành công", description: "Tài khoản đã được tạo và đăng nhập tự động." });
      navigate("/student/dashboard");
    } catch (error: any) {
      notification.error({ message: "Đăng ký thất bại", description: error.response?.data?.message || "Vui lòng thử lại." });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    {
      key: "login",
      label: "Đăng nhập",
      children: (
        <Form layout="vertical" onFinish={handleLogin} autoComplete="off">
          <Form.Item
            name="email"
            label="Email hoặc tài khoản"
            rules={[{ required: true, message: "Nhập email hoặc tên đăng nhập" }]}
          >
            <Input placeholder="vd. admin@domain.com" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: "Nhập mật khẩu" }]}
          >
            <Input.Password placeholder="********" />
          </Form.Item>
          <Form.Item label="Vai trò">
            <Radio.Group value={role} onChange={(event) => setRole(event.target.value)}>
              <Radio value="student">Thí sinh</Radio>
              <Radio value="admin">Quản trị</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Đăng nhập ngay
            </Button>
          </Form.Item>
        </Form>
      )
    },
    {
      key: "register",
      label: "Đăng ký thí sinh",
      children: (
        <Form layout="vertical" onFinish={handleRegister} autoComplete="off">
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: "Nhập họ và tên" }]}
          >
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Nhập email" }, { type: "email", message: "Email không hợp lệ" }]}
          >
            <Input placeholder="vd. student@domain.com" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: "Nhập mật khẩu" }, { min: 6, message: "Mật khẩu phải từ 6 ký tự" }]}
          >
            <Input.Password placeholder="********" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Tạo tài khoản
            </Button>
          </Form.Item>
        </Form>
      )
    }
  ];

  return (
    <div className="auth-shell" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0f69ff 0%, #3148ff 100%)" }}>
      <Card style={{ width: 420, borderRadius: 24, boxShadow: "0 32px 80px rgba(15, 23, 42, 0.25)" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Title level={3} style={{ marginBottom: 8 }}>Cổng tuyển sinh đại học</Title>
          <Text type="secondary">Đăng nhập hoặc đăng ký để tiếp tục quản lý hồ sơ.</Text>
        </div>

        <Tabs activeKey={activeTab} items={tabs} onChange={(key) => setActiveTab(key)} />

        <Space direction="vertical" size="small" style={{ marginTop: 16, width: "100%" }}>
          <Text type="secondary">Đối với quản trị viên, hãy chọn vai trò Quản trị khi đăng nhập.</Text>
          <Text type="secondary">Thí sinh mới sẽ được chuyển thẳng đến trang tổng quan hồ sơ.</Text>
        </Space>
      </Card>
    </div>
  );
}
