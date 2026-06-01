import { Button, Card, Form, Input, message, Typography } from "antd";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../api/authApi";
import { setToken, setUser } from "../../utils/auth";

const { Title } = Typography;

export default function AdminAuthPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response = await login({
        email: values.email,
        password: values.password
      });

      if (response.user.role !== "admin") {
        message.error("Tài khoản không có quyền quản trị.");
        return;
      }

      setToken(response.token);
      setUser(response.user);
      message.success("Đăng nhập quản trị viên thành công.");
      navigate("/admin/dashboard");
    } catch (error: any) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error("Lỗi kết nối tới máy chủ.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <Card className="auth-card" bordered>
        <Title level={3}>Đăng nhập Quản trị viên</Title>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Vui lòng nhập email" }, { type: "email", message: "Email không hợp lệ" }]}
          >
            <Input placeholder="admin@example.com" />
          </Form.Item>
          <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }] }>
            <Input.Password placeholder="********" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
