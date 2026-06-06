// frontend/src/pages/layouts/StudentLayout.tsx
import React, { useEffect, useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography, Badge, message, Space } from 'antd';
import { 
  DashboardOutlined, FormOutlined, EyeOutlined, 
  LogoutOutlined, UserOutlined, BellOutlined 
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

// ====================== IMPORT ĐÃ SỬA ======================
import {
  clearAuth
} from "../../utils/auth";
import { getMe } from "../../api/authApi";
// ==========================================================

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const StudentLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const data = await getMe();
      setUser(data);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin user:", error);
      // Fallback
      setUser({
        fullName: "Thí sinh",
        email: "student@example.com"
      });
    }
  };

  const handleLogout = () => {
  clearAuth();

  message.success("Đăng xuất thành công!");
  navigate("/candidate/login");
};

  const menuItems = [
    { key: "/student/dashboard", icon: <DashboardOutlined />, label: "Tổng quan" },
    { key: "/student/apply", icon: <FormOutlined />, label: "Nộp hồ sơ xét tuyển" },
    { key: "/student/tracking", icon: <EyeOutlined />, label: "Theo dõi hồ sơ" },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={280} theme="light" style={{ boxShadow: '2px 0 12px rgba(0,0,0,0.1)' }}>
        <div style={{ 
          height: 70, 
          background: '#1890ff', 
          color: 'white', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: 18, 
          fontWeight: 'bold' 
        }}>
          🎓 PORTAL THÍ SINH
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key as string)}
          style={{ marginTop: 16 }}
        />
      </Sider>

      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 30px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
            <Title level={4} style={{ margin: 0 }}>
              Hệ thống Xét tuyển Đại học 2026
            </Title>

            <Space size="large">
              <Badge count={3}>
                <BellOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
              </Badge>

              <Dropdown 
                trigger={['click']}
                menu={{
                  items: [
                    { label: 'Thông tin cá nhân', key: 'profile' },
                    { type: 'divider' },
                    { 
                      label: 'Đăng xuất', 
                      key: 'logout', 
                      danger: true, 
                      icon: <LogoutOutlined />, 
                      onClick: handleLogout 
                    }
                  ]
                }}
              >
                <Space style={{ cursor: 'pointer' }}>
                  <Avatar size={40} icon={<UserOutlined />} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{user?.fullName || "Thí sinh"}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{user?.email}</div>
                  </div>
                </Space>
              </Dropdown>
            </Space>
          </div>
        </Header>

        <Content style={{ 
          margin: '24px 24px', 
          padding: '24px', 
          background: '#fff', 
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)' 
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default StudentLayout;