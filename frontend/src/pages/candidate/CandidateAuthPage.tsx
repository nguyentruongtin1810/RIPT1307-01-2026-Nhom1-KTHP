import { Button, Card, Form, Input, message, Typography } from "antd";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, register } from "../../api/authApi";
import { setToken, setUser } from "../../utils/auth";

const { Title, Text } = Typography;

export default function CandidateAuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response = isRegister
        ? await register({
            fullName: values.fullName,
            email: values.email,
            password: values.password
          })
        : await login({
            email: values.email,
            password: values.password
          });

      setToken(response.token);
      setUser(response.user);

      message.success(isRegister ? "Đăng ký thành công. Bạn đã được đăng nhập." : "Đăng nhập thành công.");
      navigate("/candidate/application");
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
        <Title level={3}>{isRegister ? "Đăng ký thí sinh" : "Đăng nhập thí sinh"}</Title>
        <Form layout="vertical" onFinish={onFinish}>
          {isRegister && (
            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
            >
              <Input placeholder="Nguyễn Văn A" />
            </Form.Item>
          )}

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Vui lòng nhập email" }, { type: "email", message: "Email không hợp lệ" }]}
          >
            <Input placeholder="email@example.com" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
          >
            <Input.Password placeholder="********" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              {isRegister ? "Đăng ký" : "Đăng nhập"}
            </Button>
          </Form.Item>
        </Form>

        <Text type="secondary">
          {isRegister ? "Đã có tài khoản? " : "Chưa có tài khoản? "}
          <a onClick={() => setIsRegister(!isRegister)} style={{ marginLeft: 4, cursor: "pointer" }}>
            {isRegister ? "Đăng nhập" : "Đăng ký"}
          </a>
        </Text>

        <div style={{ marginTop: 16 }}>
          <Link to="/candidate/application">Đi tới Đăng ký xét tuyển</Link>
          <br />
          <Link to="/candidate/tracking">Theo dõi hồ sơ</Link>
        </div>
      </Card>
    </div>
  );
}
