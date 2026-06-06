import { useEffect, useMemo, useState } from "react";
import { Card, Col, Progress, Row, Statistic, Typography, message } from "antd";
import { getAdminStats } from "../../api/adminApi";

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
      <Card style={{ marginTop: 24, borderRadius: 20, boxShadow: "0 18px 60px rgba(15, 23, 42, 0.08)" }}>
        <Title level={5}>Ứng viên theo trường và ngành</Title>
        {stats?.majorUniversityCounts?.length ? (
          stats.majorUniversityCounts.map((item: any) => (
            <div key={`${item.university}-${item.major}`} style={{ marginBottom: 12 }}>
              <Text strong>{item.university}</Text> - <Text>{item.major}</Text>
              <div style={{ color: "rgba(0,0,0,0.45)" }}>{item.count} hồ sơ</div>
            </div>
          ))
        ) : (
          <Text type="secondary">Không có dữ liệu trường/ngành.</Text>
        )}
      </Card>
    </div>
  );
}
