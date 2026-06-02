import React from "react";
import { Layout, Menu } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { DashboardOutlined, FormOutlined, EyeOutlined, LogoutOutlined } from "@ant-design/icons";
import { removeToken, removeUserRole } from "../../utils/auth";

const { Header, Sider, Content } = Layout;

export default function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    removeToken();
    removeUserRole();
    navigate("/candidate/login");
  };

  const menuItems = [
    { key: "/student/dashboard", icon: <DashboardOutlined />, label: "Tổng quan" },
    { key: "/student/apply", icon: <FormOutlined />, label: "Đăng ký xét tuyển" },
    { key: "/student/tracking", icon: <EyeOutlined />, label: "Theo dõi hồ sơ" },
    { key: "logout", icon: <LogoutOutlined />, label: "Đăng xuất", danger: true },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth="0" theme="light" style={{ boxShadow: "2px 0 8px rgba(0,0,0,0.05)" }}>
        <div style={{ height: "64px", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid #f0f0f0" }}>
          <strong style={{ color: "#1890ff", fontSize: "16px" }}>PORTAL THÍ SINH</strong>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => {
            if (key === "logout") handleLogout();
            else navigate(key);
          }}
        />
      </Sider>
      <Layout>
        <Header style={{ background: "#fff", padding: 0, height: "64px", borderBottom: "1px solid #f0f0f0" }} />
        <Content style={{ margin: "24px 16px", padding: 24, background: "#fff", borderRadius: "8px", minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}