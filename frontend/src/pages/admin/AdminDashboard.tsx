import { useEffect, useMemo, useState } from "react";
import { Card, Col, Progress, Row, Statistic, Typography, message } from "antd";
import { getAdminStats } from "../../api/adminApi";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const { Title, Text } = Typography;

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể tải số liệu thống kê.");
    } finally {
      setLoading(false);
    }
  }

  const approvedCount = useMemo(() => {
    return stats?.statusCounts?.find((item: any) => item.status === "approved")?.count || 0;
  }, [stats]);

  const pendingCount = useMemo(() => {
    return stats?.statusCounts?.find((item: any) => item.status === "pending")?.count || 0;
  }, [stats]);

  const rejectedCount = useMemo(() => {
    return stats?.statusCounts?.find((item: any) => item.status === "rejected")?.count || 0;
  }, [stats]);

  const approvalRate = useMemo(() => {
    const total = stats?.totalApplications || 0;
    return total ? Math.round((approvedCount / total) * 100) : 0;
  }, [approvedCount, stats]);

  const pieData = [
    { name: "Đã duyệt", value: approvedCount, color: "#52c41a" },
    { name: "Chờ xử lý", value: pendingCount, color: "#fa8c16" },
    { name: "Từ chối", value: rejectedCount, color: "#f5222d" }
  ];

  const barData = useMemo(() => {
    if (!stats?.majorUniversityCounts) return [];
    return stats.majorUniversityCounts.map((item: any) => ({
      name: `${item.university} - ${item.major}`,
      "Số lượng": item.count
    }));
  }, [stats]);

  return (
    <div className="page-shell">
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card loading={loading} bordered={false} style={{ borderRadius: 20, boxShadow: "0 18px 60px rgba(15, 23, 42, 0.08)" }}>
            <Statistic title="Tổng số hồ sơ" value={stats?.totalApplications || 0} />
            <Text type="secondary">Tổng số ứng viên đã nộp hồ sơ tính đến hiện tại.</Text>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card loading={loading} bordered={false} style={{ borderRadius: 20, boxShadow: "0 18px 60px rgba(15, 23, 42, 0.08)" }}>
            <Statistic title="Tỷ lệ duyệt" value={`${approvalRate}%`} />
            <Progress percent={approvalRate} status={approvalRate >= 80 ? "success" : approvalRate >= 50 ? "normal" : "exception"} style={{ marginTop: 16 }} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card loading={loading} bordered={false} style={{ borderRadius: 20, boxShadow: "0 18px 60px rgba(15, 23, 42, 0.08)" }}>
            <Statistic title="Chờ xử lý" value={pendingCount} valueStyle={{ color: "#fa8c16" }} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card loading={loading} bordered={false} style={{ borderRadius: 20, boxShadow: "0 18px 60px rgba(15, 23, 42, 0.08)" }}>
            <Statistic title="Đã duyệt" value={approvedCount} valueStyle={{ color: "#52c41a" }} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card loading={loading} bordered={false} style={{ borderRadius: 20, boxShadow: "0 18px 60px rgba(15, 23, 42, 0.08)" }}>
            <Statistic title="Đã từ chối" value={rejectedCount} valueStyle={{ color: "#f5222d" }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} md={10}>
          <Card title="Tỷ lệ Trạng thái Hồ sơ" bordered={false} style={{ borderRadius: 20, boxShadow: "0 18px 60px rgba(15, 23, 42, 0.08)", height: "100%" }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} md={14}>
          <Card title="Số lượng Thí sinh theo Trường / Ngành" bordered={false} style={{ borderRadius: 20, boxShadow: "0 18px 60px rgba(15, 23, 42, 0.08)", height: "100%" }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="Số lượng" fill="#1890ff" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
