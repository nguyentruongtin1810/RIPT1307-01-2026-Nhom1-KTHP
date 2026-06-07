import { Avatar, Breadcrumb, Dropdown, Layout, Menu, Typography } from "antd";
import {
  DashboardOutlined,
  FileTextOutlined,
  ProfileOutlined,
  LogoutOutlined,
  UserOutlined
} from "@ant-design/icons";
import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { clearAuth, getUser } from "../utils/auth";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

type BreadcrumbItem = {
  title: string;
  path?: string;
};

type StudentLayoutProps = {
  children: ReactNode;
  breadcrumbItems?: BreadcrumbItem[];
};

export default function StudentLayout({ children, breadcrumbItems = [] }: StudentLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();

  const items = [
    {
      key: "/student/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard"
    },
    {
      key: "/student/apply",
      icon: <FileTextOutlined />,
      label: "Nộp hồ sơ"
    },
    {
      key: "/student/status",
      icon: <ProfileOutlined />,
      label: "Trạng thái"
    }
  ];

  const selectedKey = items.some((item) => item.key === location.pathname)
    ? location.pathname
    : "/student/dashboard";

  const profileMenu = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất"
    }
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === "logout") {
      clearAuth();
      navigate("/login");
    }
  };

  const username = user?.fullName || "Người dùng";
  const initials = username
    .split(" ")
    .map((token: string) => token[0])
    .slice(0, 2)
    .join("");

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={280}
        theme="light"
        breakpoint="lg"
        collapsedWidth="0"
        style={{ boxShadow: "2px 0 18px rgba(0, 0, 0, 0.06)" }}
      >
        <div style={{ padding: 32, textAlign: "center" }}>
          <div
            style={{
              margin: "0 auto 16px",
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <UserOutlined style={{ color: "white", fontSize: 24 }} />
          </div>
          <Text strong style={{ fontSize: 20 }}>
            Sinh viên
          </Text>
          <div style={{ marginTop: 8, color: "rgba(0,0,0,0.45)" }}>Bảng điều khiển</div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={items}
          style={{ borderRight: 0 }}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            background: "#fff",
            boxShadow: "0 1px 10px rgba(0, 0, 0, 0.04)"
          }}
        >
          <Breadcrumb
            items={
              breadcrumbItems.length
                ? breadcrumbItems.map((item) => ({
                    title: item.path ? <a onClick={() => item.path && navigate(item.path)}>{item.title}</a> : item.title
                  }))
                : [{ title: "Dashboard" }]
            }
          />

          <Dropdown menu={{ items: profileMenu, onClick: handleMenuClick }} placement="bottomRight">
            <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
              <Avatar style={{ backgroundColor: "#6366f1" }}>
                {initials}
              </Avatar>
              <div style={{ textAlign: "right" }}>
                <Text strong>{username}</Text>
                <div style={{ color: "rgba(0,0,0,0.45)", fontSize: 12 }}>Student</div>
              </div>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, overflow: "hidden" }}>
          <div style={{ padding: 24, minHeight: 560, borderRadius: 24, background: "#fff", boxShadow: "0 18px 60px rgba(15, 23, 42, 0.08)" }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
