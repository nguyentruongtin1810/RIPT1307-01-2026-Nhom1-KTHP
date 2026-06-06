// frontend/src/pages/candidate/CandidateAuthPage.tsx

import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  message,
  Tabs,
} from "antd";
import {
  MailOutlined,
  LockOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { login, register } from "../../api/authApi";

const { Title, Text } = Typography;

export default function CandidateAuthPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  const handleLogin = async (values: any) => {
    setLoading(true);

    try {
      const data = await login({
        identifier: values.email,
        password: values.password,
      });

      if (data?.token) {
  localStorage.setItem("token", data.token);

  localStorage.setItem(
    "role",
    data.user?.role || "student"
  );

  localStorage.setItem(
    "fullName",
    data.user?.fullName || ""
  );

  localStorage.setItem(
    "email",
    data.user?.email || ""
  );

        message.success("Đăng nhập thành công!");

        setTimeout(() => {
          const role = data.user?.role || "student";

          navigate(
            role === "admin"
              ? "/admin/dashboard"
              : "/student/dashboard"
          );
        }, 500);
      }
    } catch (err: any) {
      message.error(err?.message || "Sai tài khoản hoặc mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: any) => {
    setLoading(true);

    try {
      await register(values);

      message.success("Đăng ký thành công!");
      setActiveTab("login");
    } catch (err: any) {
      message.error(err?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: "login",
      label: "Đăng nhập",
      children: (
        <Form
          layout="vertical"
          onFinish={handleLogin}
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập email",
              },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mật khẩu"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            size="large"
          >
            ĐĂNG NHẬP <ArrowRightOutlined />
          </Button>
        </Form>
      ),
    },
    {
      key: "register",
      label: "Đăng ký",
      children: (
        <Form
          layout="vertical"
          onFinish={handleRegister}
          size="large"
        >
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                type: "email",
              },
            ]}
          >
            <Input prefix={<MailOutlined />} />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              {
                required: true,
                min: 6,
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            size="large"
          >
            TẠO TÀI KHOẢN
          </Button>
        </Form>
      ),
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "#f5f7fa",
      }}
    >
      {/* Banner trái */}
      <div
        style={{
          width: "50%",
          background:
            "linear-gradient(135deg, #0f172a, #1d4ed8)",
          color: "#fff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 40,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Title
            level={1}
            style={{
              color: "#fff",
              marginBottom: 10,
            }}
          >
            TUYỂN SINH 2026
          </Title>

          <Title
            level={3}
            style={{ color: "#fff" }}
          >
            Đại học ABC
          </Title>

          <Text
            style={{
              color: "#fff",
              fontSize: 18,
            }}
          >
            Hệ thống xét tuyển học bạ điện tử
          </Text>
        </div>
      </div>

      {/* Form phải */}
      <div
        style={{
          width: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 40,
        }}
      >
        <Card
          variant="borderless"
          style={{
            width: 500,
            borderRadius: 16,
            boxShadow:
              "0 10px 30px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            <Title level={2}>
              Chào mừng đến hệ thống
            </Title>

            <Text type="secondary">
              Đăng nhập hoặc tạo tài khoản
            </Text>
          </div>

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            centered
            items={tabItems}
          />
        </Card>
      </div>
    </div>
  );
}