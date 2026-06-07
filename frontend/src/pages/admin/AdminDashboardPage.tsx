import { Button, Card, Layout, Menu, Row, Col, Statistic, Space, Table, Typography, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { fetchApplications } from "../../api/adminApi";
import { UserOutlined, LogoutOutlined, DashboardOutlined, FileTextOutlined, AppstoreOutlined } from "@ant-design/icons";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

export default function AdminDashboardPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchApplications();
        // Đảm bảo tương thích cấu trúc response từ API (mảng hoặc object chứa data)
        setApplications(data.data || data || []);
      } catch (error: any) {
        message.error(error.response?.data?.message || "Không thể tải dữ liệu thống kê.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const stats = useMemo(() => {
    let pending = 0, approved = 0, rejected = 0;
    applications.forEach((app) => {
      const status = app.status?.toLowerCase();
      if (status === "pending") pending++;
      else if (status === "approved") approved++;
      else if (status === "rejected") rejected++;
    });
    return { total: applications.length, pending, approved, rejected };
  }, [applications]);

  const breakdownData = useMemo(() => {
    const map = new Map();
    applications.forEach((app) => {
      const key = `${app.university || "N/A"}_${app.major || "N/A"}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          university: app.university || "Chưa xác định",
          major: app.major || "Chưa xác định",
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0
        });
      }
      const record = map.get(key);
      record.total += 1;
      const status = app.status?.toLowerCase();
      if (status === "pending") record.pending += 1;
      else if (status === "approved") record.approved += 1;
      else if (status === "rejected") record.rejected += 1;
    });
    return Array.from(map.values());
  }, [applications]);

  const columns = [
    { title: "Trường Đại học", dataIndex: "university", key: "university" },
    { title: "Ngành học", dataIndex: "major", key: "major" },
    { title: "Tổng số hồ sơ", dataIndex: "total", key: "total", align: "center" as const },
    { title: "Chờ xử lý", dataIndex: "pending", key: "pending", align: "center" as const },
    { title: "Đã duyệt", dataIndex: "approved", key: "approved", align: "center" as const },
    { title: "Từ chối", dataIndex: "rejected", key: "rejected", align: "center" as const }
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={260} theme="dark" style={{ background: "#001529" }}>
        <div className="logo" style={{ padding: "24px 16px", textAlign: "center" }}>
          <Title level={4} style={{ color: "#fff", margin: 0, fontWeight: 700 }}>
            Admin Portal
          </Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["1"]}
          items={[
            { key: "1", icon: <DashboardOutlined />, label: "Bảng thống kê" },
            { key: "2", icon: <FileTextOutlined />, label: "Quản lý Hồ sơ" },
            { key: "3", icon: <AppstoreOutlined />, label: "Quản lý Danh mục" }
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ background: "#fff", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 4px rgba(0,21,41,.08)", zIndex: 1 }}>
          <Title level={4} style={{ margin: 0 }}>Tổng quan hệ thống</Title>
          <Space size="large">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <UserOutlined style={{ fontSize: "18px" }} />
              <Typography.Text strong>Quản trị viên</Typography.Text>
            </div>
            <Button type="text" icon={<LogoutOutlined />} danger>
              Đăng xuất
            </Button>
          </Space>
        </Header>
        <Content style={{ margin: "24px", background: "#f0f2f5" }}>
          <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                <Statistic title="Tổng số hồ sơ" value={stats.total} valueStyle={{ color: "#1890ff", fontWeight: 600 }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                <Statistic title="Hồ sơ chờ xử lý" value={stats.pending} valueStyle={{ color: "#faad14", fontWeight: 600 }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                <Statistic title="Hồ sơ đã duyệt" value={stats.approved} valueStyle={{ color: "#52c41a", fontWeight: 600 }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                <Statistic title="Hồ sơ bị từ chối" value={stats.rejected} valueStyle={{ color: "#ff4d4f", fontWeight: 600 }} />
              </Card>
            </Col>
          </Row>

          <Card title={<Title level={5} style={{ margin: 0 }}>Phân tích số lượng theo Trường & Ngành</Title>} style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <Table
              rowKey="key"
              loading={loading}
              dataSource={breakdownData}
              columns={columns}
              pagination={{ pageSize: 10 }}
              size="middle"
            />
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
}
