import { Card, Col, Row, Space, Spin, Tag, Typography, Button } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApplicationStatus } from "../../api/candidateApi";
import { getToken, getUserRole } from "../../utils/auth";

const { Title, Text } = Typography;

const statusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: "orange", label: "Chờ xử lý" },
  approved: { color: "green", label: "Đã duyệt" },
  rejected: { color: "red", label: "Từ chối" }
};

export default function StudentDashboard() {
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!getToken() || getUserRole() !== "student") {
      navigate("/login");
      return;
    }

    async function loadStatus() {
      setLoading(true);
      try {
        const data = await getApplicationStatus();
        setApplication(data);
      } catch (error: any) {
        setApplication(null);
      } finally {
        setLoading(false);
      }
    }

    loadStatus();
  }, [navigate]);

  const statusKey = application?.status?.toLowerCase() || "pending";
  const statusMeta = statusConfig[statusKey] || statusConfig.pending;

  return (
    <div className="page-shell">
      <Card className="page-card" title={<Title level={4}>Tổng quan hồ sơ xét tuyển</Title>}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 64 }}>
            <Spin size="large" />
          </div>
        ) : application ? (
          <>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={8}>
                <Card bordered={false} style={{ borderRadius: 16, boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)" }}>
                  <Text type="secondary">Trạng thái hiện tại</Text>
                  <div style={{ marginTop: 16 }}>
                    <Tag color={statusMeta.color}>{statusMeta.label}</Tag>
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card bordered={false} style={{ borderRadius: 16, boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)" }}>
                  <Text type="secondary">Nguyện vọng</Text>
                  <div style={{ marginTop: 16 }}>
                    <Title level={5} style={{ marginBottom: 4 }}>
                      {application.university}
                    </Title>
                    <Text>{application.major}</Text>
                    <div>
                      <Text type="secondary">Tổ hợp: </Text>
                      <Text>{application.subject_group}</Text>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card bordered={false} style={{ borderRadius: 16, boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)" }}>
                  <Text type="secondary">Điểm xét tuyển</Text>
                  <div style={{ marginTop: 16 }}>
                    {application.scores &&
                      Object.entries(application.scores).map(([key, value]) => (
                        <div key={key} style={{ marginBottom: 8 }}>
                          <Text strong>{key.replace(/score/i, "").toUpperCase()}: </Text>
                          <Text>{String(value)}</Text>
                        </div>
                      ))}
                  </div>
                </Card>
              </Col>
            </Row>

            <Row style={{ marginTop: 24 }}>
              <Col span={24}>
                <Card bordered={false} style={{ borderRadius: 16, boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)" }}>
                  <Space direction="vertical">
                    <Text type="secondary">Ngày gửi</Text>
                    <Text>{new Date(application.created_at).toLocaleDateString()}</Text>
                    <Text type="secondary">Email liên hệ</Text>
                    <Text>{application.candidate_email}</Text>
                  </Space>
                </Card>
              </Col>
            </Row>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: 64 }}>
            <Title level={5}>Chưa có hồ sơ xét tuyển</Title>
            <Text>Hãy gửi hồ sơ mới để bắt đầu quá trình xét tuyển.</Text>
            <div style={{ marginTop: 24 }}>
              <Button type="primary" onClick={() => navigate("/student/apply")}>Nộp hồ sơ ngay</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
