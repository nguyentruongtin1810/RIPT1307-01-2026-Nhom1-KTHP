import { Button, Card, Col, Form, Input, notification, Radio, Row, Space, Tabs, Typography } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/authApi";
import { setToken, setUser } from "../utils/auth";
import RegisterForm, { RegisterFormValues } from "./Register";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const roleOptions = [
  { label: "Thí sinh", value: "student" },
  { label: "Admin", value: "admin" }
];

type LoginFormValues = {
  emailOrUsername: string;
  password: string;
  role: "student" | "admin";
};

export default function Login() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values: LoginFormValues) => {
    const payload = {
      emailOrUsername: values.emailOrUsername,
      password: values.password
    };

    console.log("Payload sent:", payload);
    setLoading(true);

    try {
      const response = await login(payload);

      if (response.user.role !== values.role) {
        const mismatchMessage = "Vai trò chọn không khớp với tài khoản. Vui lòng thử lại.";
        notification.error({ message: "Lỗi Hệ Thống", description: mismatchMessage, duration: 5 });
        setLoading(false);
        return;
      }

      setToken(response.token);
      setUser(response.user);

      notification.success({
        message: "Đăng nhập thành công",
        description: "Bạn đã đăng nhập thành công vào hệ thống.",
        duration: 4
      });

      if (values.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || "Unknown error occurred";
      console.error("Detailed Auth Error:", error);

      if (error.response) {
        if (error.response.status === 400) {
          notification.error({ message: "Lỗi Hệ Thống", description: errorMsg, duration: 5 });
        } else if (error.response.status === 401) {
          notification.error({ message: "Lỗi Hệ Thống", description: "Sai tài khoản hoặc mật khẩu", duration: 5 });
        } else {
          notification.error({ message: "Lỗi Hệ Thống", description: errorMsg, duration: 5 });
        }
      } else if (error.request) {
        notification.error({
          message: "Lỗi Hệ Thống",
          description: "Không thể kết nối đến Server Backend (Cổng 4000) hoặc lỗi CORS!",
          duration: 5
        });
      } else {
        notification.error({ message: "Lỗi Hệ Thống", description: errorMsg, duration: 5 });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSuccess = () => {
    setActiveTab("login");
  };

  return (
    <Row style={{ minHeight: "100vh" }}>
      <Col
        span={14}
        style={{
          background: "linear-gradient(135deg, #1890ff 0%, #0050b3 100%)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "56px 64px"
        }}
      >
        <div style={{ maxWidth: 560 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 28,
              background: "rgba(255,255,255,0.16)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 32
            }}
          >
            <Text style={{ color: "white", fontWeight: 800, fontSize: 28 }}>TS</Text>
          </div>
          <Title style={{ color: "white", fontSize: 52, lineHeight: 1.05, marginBottom: 24 }}>
            Cổng Thông Tin Tuyển Sinh
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.82)", fontSize: 18, lineHeight: 1.8 }}>
            Đăng nhập hoặc đăng ký thí sinh mới ngay bây giờ để quản lý hồ sơ, nộp xét tuyển và theo dõi tiến trình một cách trực quan và hiệu quả.
          </Text>
          <Space direction="vertical" size={16} style={{ marginTop: 32 }}>
            <Card style={{ background: "rgba(255,255,255,0.08)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.14)" }} bodyStyle={{ padding: 22 }}>
              <Text strong style={{ color: "#f8fafc", fontSize: 16 }}>
                Tính năng nổi bật:
              </Text>
              <ul style={{ color: "rgba(248, 250, 252, 0.85)", margin: "16px 0 0 16px", paddingInlineStart: 18 }}>
                <li>Đăng nhập nhanh theo vai trò Admin hoặc Student</li>
                <li>Đăng ký thí sinh mới với form thông minh</li>
                <li>Điều hướng tự động đến dashboard phù hợp</li>
              </ul>
            </Card>
          </Space>
        </div>
      </Col>

      <Col
        span={10}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f0f2f5",
          padding: "48px 32px"
        }}
      >
        <Card
          style={{
            width: "100%",
            maxWidth: 460,
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <Title level={3} style={{ marginBottom: 8 }}>
              Quản lý tài khoản
            </Title>
            <Text type="secondary">Chuyển đổi nhanh giữa đăng nhập và đăng ký thí sinh.</Text>
          </div>

          <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key as "login" | "register")}> 
            <TabPane tab="Đăng nhập" key="login">
              <Form layout="vertical" onFinish={handleLogin} requiredMark={false} initialValues={{ role: "student" }}>
                <Form.Item
                  label="Email hoặc Username"
                  name="emailOrUsername"
                  rules={[{ required: true, message: "Vui lòng nhập email hoặc username" }]}
                >
                  <Input size="large" placeholder="admin@tuyensinh.edu.vn hoặc username" />
                </Form.Item>

                <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}> 
                  <Input.Password size="large" placeholder="********" />
                </Form.Item>

                <Form.Item label="Vai trò" name="role" rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}> 
                  <Radio.Group options={roleOptions} optionType="button" buttonStyle="solid" />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                    Đăng nhập
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>

            <TabPane tab="Đăng ký thí sinh" key="register">
              <RegisterForm onSuccess={handleRegisterSuccess} />
            </TabPane>
          </Tabs>
        </Card>
      </Col>
    </Row>
  );
}
