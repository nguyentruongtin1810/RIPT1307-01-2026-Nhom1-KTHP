import { Button, Form, Input, notification } from "antd";
import { useState } from "react";
import { register } from "../api/authApi";
import { MailOutlined, LockOutlined, IdcardOutlined, PhoneOutlined } from "@ant-design/icons";

export type RegisterFormValues = {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
};

type RegisterProps = {
  onSuccess: () => void;
};

export default function RegisterForm({ onSuccess }: RegisterProps) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleRegister = async (values: RegisterFormValues) => {
    const payload = {
      ...values,
      username: values.email
    };

    setLoading(true);

    try {
      await register(payload);
      notification.success({
        message: "Đăng ký thành công!",
        description: "Tài khoản đã được tạo. Vui lòng đăng nhập để tiếp tục."
      });
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Đã có lỗi xảy ra trong quá trình đăng ký.";
      notification.error({ message: "Đăng ký thất bại", description: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleRegister} size="large">
      <Form.Item
        name="fullName"
        rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
      >
        <Input prefix={<IdcardOutlined />} placeholder="Họ và tên đầy đủ" />
      </Form.Item>

      <Form.Item
        name="email"
        rules={[
          { required: true, message: "Vui lòng nhập email!" },
          { type: "email", message: "Email không hợp lệ!" }
        ]}
      >
        <Input prefix={<MailOutlined />} placeholder="Email" />
      </Form.Item>

      <Form.Item 
        name="phone" 
        rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
      >
        <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[
          { required: true, message: "Vui lòng nhập mật khẩu!" },
          { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự." }
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block loading={loading} style={{ borderRadius: 12 }}>
          Đăng ký
        </Button>
      </Form.Item>
    </Form>
  );
}
