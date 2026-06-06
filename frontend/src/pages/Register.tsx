import { Button, Form, Input, notification } from "antd";
import { useState } from "react";
import { register } from "../api/authApi";

export type RegisterFormValues = {
  fullName: string;
  email: string;
  password: string;
};

type RegisterProps = {
  onSuccess: () => void;
};

export default function RegisterForm({ onSuccess }: RegisterProps) {
  const [loading, setLoading] = useState(false);

  const handleRegister = async (values: RegisterFormValues) => {
    const payload = {
      fullName: values.fullName,
      email: values.email,
      password: values.password,
      username: values.email
    };

    console.log("Payload sent:", payload);
    setLoading(true);

    try {
      await register(payload);
      notification.success({
        message: "Đăng ký thành công",
        description: "Tài khoản đã được tạo. Vui lòng đăng nhập để tiếp tục.",
        duration: 5
      });
      onSuccess();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || "Unknown error occurred";
      console.error("Detailed Auth Error:", error);

      if (error.response) {
        if (error.response.status === 400) {
          notification.error({
            message: "Lỗi Hệ Thống",
            description: errorMsg,
            duration: 5
          });
        } else {
          notification.error({
            message: "Lỗi Hệ Thống",
            description: errorMsg,
            duration: 5
          });
        }
      } else if (error.request) {
        notification.error({
          message: "Lỗi Hệ Thống",
          description: "Không thể kết nối đến Server Backend (Cổng 4000) hoặc lỗi CORS!",
          duration: 5
        });
      } else {
        notification.error({
          message: "Lỗi Hệ Thống",
          description: errorMsg,
          duration: 5
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form layout="vertical" onFinish={handleRegister} requiredMark={false}>
      <Form.Item
        label="Họ và tên"
        name="fullName"
        rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
      >
        <Input size="large" placeholder="Nguyễn Văn A" />
      </Form.Item>

      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: "Vui lòng nhập email" },
          { type: "email", message: "Email không hợp lệ" }
        ]}
      >
        <Input size="large" placeholder="email@tuyensinh.edu.vn" />
      </Form.Item>

      <Form.Item
        label="Mật khẩu"
        name="password"
        rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
      >
        <Input.Password size="large" placeholder="********" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ borderRadius: 12 }}>
          Đăng ký thí sinh
        </Button>
      </Form.Item>
    </Form>
  );
}
