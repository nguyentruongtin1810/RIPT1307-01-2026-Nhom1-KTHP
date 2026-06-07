import { Card, Timeline, Spin, Tag, Typography, Alert, Space, Row, Col } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApplicationStatus } from "../../api/candidateApi";
import { getToken, getUserRole } from "../../utils/auth";

const { Title, Text } = Typography;

const statusTag = {
  pending: { color: "orange", label: "Chờ xử lý" },
  approved: { color: "green", label: "Đã duyệt" },
  rejected: { color: "red", label: "Từ chối" }
};

export default function CandidateTrackingPage() {
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!getToken() || getUserRole() !== "student") {
      navigate("/login");
      return;
    }

    async function loadApplication() {
      setLoading(true);
      try {
        const result = await getApplicationStatus();
        setDetail(result);
      } catch (error: any) {
        setDetail(null);
      } finally {
        setLoading(false);
      }
    }

    loadApplication();
  }, [navigate]);

  const application = detail?.application;
  const timeline = detail?.timeline || [];
  const statusMeta = statusTag[application?.status as keyof typeof statusTag] || { color: "default", label: "Không xác định" };

  return (
    <div className="page-shell">
      <Card className="page-card" title={<Title level={4}>Theo dõi hồ sơ xét tuyển</Title>}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 48 }}>
            <Spin size="large" />
          </div>
        ) : application ? (
          <>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={16}>
                <Card size="small" style={{ borderRadius: 16, marginBottom: 24 }}>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Text strong>Họ và tên</Text>
                    <Text>{application.candidate_name}</Text>
                    <Text strong>Email</Text>
                    <Text>{application.candidate_email}</Text>
                    <Text strong>Trạng thái hiện tại</Text>
                    <Tag color={statusMeta.color}>{statusMeta.label}</Tag>
                  </Space>
                </Card>
                <Card size="small" style={{ borderRadius: 16 }}>
                  <Title level={5}>Lịch sử tiến độ</Title>
                  <Timeline>
                    {timeline.map((item: any) => (
                      <Timeline.Item key={item.stage} color={item.completed ? "green" : "gray"}>
                        <Text strong>{item.stage}</Text>
                        <div>{item.timestamp ? new Date(item.timestamp).toLocaleString() : "Chưa có"}</div>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card size="small" style={{ borderRadius: 16, minHeight: 240 }}>
                  <Title level={5}>Chi tiết hồ sơ</Title>
                    <Space direction="vertical" size="middle">
                      <Text><Text strong>Trường:</Text> {application.university}</Text>
                      <Text><Text strong>Ngành:</Text> {application.major}</Text>
                      <Text><Text strong>Tổ hợp:</Text> {application.subject_group}</Text>
                      <Text>{application.scores ? Number(Object.values(application.scores as Record<string, any>).reduce((sum: any, value: any) => sum + Number(value || 0), 0)) : 0}</Text>
                    </Space>
                </Card>
                {detail?.rejectionReason ? (
                  <Alert message="Lý do từ chối" description={detail.rejectionReason} type="error" showIcon style={{ marginTop: 24 }} />
                ) : null}
              </Col>
            </Row>
          </>
        ) : (
          <Alert message="Không có hồ sơ để hiển thị." description="Vui lòng nộp hồ sơ để theo dõi tiến độ xét tuyển." type="info" showIcon />
        )}
      </Card>
    </div>
  );
}
