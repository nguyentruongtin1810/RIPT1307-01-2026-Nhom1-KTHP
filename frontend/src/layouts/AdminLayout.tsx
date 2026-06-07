import { Avatar, Breadcrumb, Dropdown, Layout, Menu, Typography } from "antd";
import {
  BarChartOutlined,
  BankOutlined,
  CheckCircleOutlined,
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

type AdminLayoutProps = {
  children: ReactNode;
  breadcrumbItems?: BreadcrumbItem[];
};

export default function AdminLayout({ children, breadcrumbItems = [] }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();

  const items = [
    {
      key: "/admin/dashboard",
      icon: <BarChartOutlined />,
      label: "Thống kê"
    },
    {
      key: "/admin/applications",
      icon: <CheckCircleOutlined />,
      label: "Duyệt hồ sơ"
    },
    {
      key: "/admin/categories",
      icon: <BankOutlined />,
      label: "Trường/Ngành"
    }
  ];

  const selectedKey = items.some((item) => item.key === location.pathname)
    ? location.pathname
    : "/admin/dashboard";

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

  const username = user?.fullName || "Quản trị viên";
  const initials = username
    .split(" ")
    .map((token: string) => token[0])
    .slice(0, 2)
    .join("");

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={280}
        theme="dark"
        breakpoint="lg"
        collapsedWidth="0"
        style={{ boxShadow: "2px 0 18px rgba(0, 0, 0, 0.24)" }}
      >
        <div style={{ padding: 32, textAlign: "center" }}>
          <div
            style={{
              margin: "0 auto 16px",
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <UserOutlined style={{ color: "white", fontSize: 24 }} />
          </div>
          <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 20, fontWeight: 700 }}>
            Quản trị viên
          </Text>
          <div style={{ marginTop: 8, color: "rgba(255,255,255,0.55)" }}>Bảng điều hành</div>
        </div>
        <Menu mode="inline" selectedKeys={[selectedKey]} items={items} onClick={({ key }) => navigate(key)} theme="dark" />
      </Sider>
      <Layout>
        <Header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            background: "#111827",
            color: "white",
            boxShadow: "0 1px 12px rgba(0, 0, 0, 0.16)"
          }}
        >
          <Breadcrumb
            items={
              breadcrumbItems.length
                ? breadcrumbItems.map((item) => ({
                    title: item.path ? (
                      <a style={{ color: "rgba(255,255,255,0.85)" }} onClick={() => item.path && navigate(item.path)}>
                        {item.title}
                      </a>
                    ) : (
                      <span style={{ color: "rgba(255,255,255,0.85)" }}>{item.title}</span>
                    )
                  }))
                : [{ title: <span style={{ color: "rgba(255,255,255,0.85)" }}>Thống kê</span> }]
            }
            style={{ color: "white" }}
          />

          <Dropdown menu={{ items: profileMenu, onClick: handleMenuClick }} placement="bottomRight">
            <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
              <Avatar style={{ backgroundColor: "#2563eb" }}>{initials}</Avatar>
              <div style={{ textAlign: "right", color: "white" }}>
                <Text strong style={{ color: "white" }}>
                  {username}
                </Text>
                <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>Administrator</div>
              </div>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, overflow: "hidden" }}>
          <div style={{ padding: 24, minHeight: 560, borderRadius: 24, background: "#1f2937", boxShadow: "0 18px 60px rgba(0, 0, 0, 0.16)" }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
