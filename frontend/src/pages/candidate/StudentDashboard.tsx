import { useEffect, useState } from "react";
import { Card, Col, Row, Tag, Typography, Button, Space, Spin, Alert } from "antd";
import { useNavigate } from "react-router-dom";
import { getStudentDashboard } from "../../api/candidateApi";
import { getToken, getUserRole } from "../../utils/auth";

const { Title, Text } = Typography;

const statusLabels: Record<string, { title: string; description: string; color: string }> = {
  pending: {
    title: "Hồ sơ đang chờ xử lý",
    description: "Đội ngũ tuyển sinh đang xem xét hồ sơ của bạn.",
    color: "orange"
  },
  approved: {
    title: "Chúc mừng! Hồ sơ đã được duyệt",
    description: "Bạn đã được chấp nhận vào ngành học đã đăng ký.",
    color: "green"
  },
  rejected: {
    title: "Hồ sơ chưa đạt yêu cầu",
    description: "Xin lỗi, hồ sơ của bạn chưa được duyệt. Vui lòng xem lý do và thử lại.",
    color: "red"
  },
  none: {
    title: "Chưa có hồ sơ xét tuyển",
    description: "Hãy bắt đầu bằng việc nộp hồ sơ mới ngay bây giờ.",
    color: "blue"
  }
};

export default function StudentDashboard() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!getToken() || getUserRole() !== "student") {
      navigate("/login");
      return;
    }

    async function loadDashboard() {
      setLoading(true);
      try {
        const data = await getStudentDashboard();
        setDashboard(data);
      } catch (error: any) {
        setDashboard(null);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [navigate]);

  const statusKey = dashboard?.applicationStatus || "none";
  const statusMeta = statusLabels[statusKey] || statusLabels.none;
  const totalScore = dashboard?.application?.scores
    ? Object.values(dashboard.application.scores).reduce((sum: number, value: any) => sum + Number(value || 0), 0)
    : 0;

  return (
    <div className="page-shell">
      <Card className="page-card" title={<Title level={4}>Cổng Thông Tin Thí Sinh</Title>}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 64 }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            <Alert
              message={statusMeta.title}
              description={statusMeta.description}
              type={statusKey === "approved" ? "success" : statusKey === "rejected" ? "error" : "info"}
              showIcon
              style={{ marginBottom: 24, borderRadius: 16 }}
            />
            <Row gutter={[24, 24]}>
              <Col xs={24} md={8}>
                <Card bordered={false} style={{ borderRadius: 16, minHeight: 180, boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)" }}>
                  <Text type="secondary">Trạng thái hồ sơ</Text>
                  <div style={{ marginTop: 16 }}>
                    <Tag color={statusMeta.color}>{statusMeta.title}</Tag>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <Text strong>Nguyện vọng hiện tại</Text>
                    <div>{dashboard?.application?.university || "Chưa chọn"}</div>
                    <div>{dashboard?.application?.major || "Chưa chọn"}</div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card bordered={false} style={{ borderRadius: 16, minHeight: 180, boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)" }}>
                  <Text type="secondary">Tổ hợp</Text>
                  <div style={{ marginTop: 16, fontSize: 18, fontWeight: 600 }}>{dashboard?.application?.subject_group || "Chưa chọn"}</div>
                  <div style={{ marginTop: 12 }}>
                    <Text type="secondary">Ưu tiên</Text>
                    <div>{dashboard?.candidate?.priorityGroup || "Không"}</div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card bordered={false} style={{ borderRadius: 16, minHeight: 180, boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)" }}>
                  <Text type="secondary">Tổng điểm dự kiến</Text>
                  <div style={{ marginTop: 16, fontSize: 36, fontWeight: 700, color: "#1890ff" }}>{totalScore.toFixed(1)}</div>
                  <div style={{ marginTop: 12 }}>
                    <Text type="secondary">Email liên hệ</Text>
                    <div>{dashboard?.candidate?.email || "-"}</div>
                  </div>
                </Card>
              </Col>
            </Row>

            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
              <Col xs={24} md={16}>
                <Card bordered={false} style={{ borderRadius: 16, boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)" }}>
                  <Space direction="vertical" size="large">
                    <div>
                      <Text type="secondary">Thông tin thí sinh</Text>
                      <div style={{ marginTop: 8 }}>
                        <div><Text strong>Họ và tên:</Text> {dashboard?.candidate?.fullName || "-"}</div>
                        <div><Text strong>Điện thoại:</Text> {dashboard?.candidate?.phone || "-"}</div>
                      </div>
                    </div>
                    <div>
                      <Text type="secondary">Lịch trình xét tuyển</Text>
                      <div style={{ marginTop: 8 }}>
                        {dashboard?.schedule?.map((item: any) => (
                          <div key={item.stage} style={{ marginBottom: 8 }}>
                            <Text strong>{item.stage}</Text> — <Text>{item.date}</Text>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card bordered={false} style={{ borderRadius: 16, boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)" }}>
                  <Text type="secondary">Tiện ích nhanh</Text>
                  <div style={{ marginTop: 16 }}>
                    <Button type="primary" block onClick={() => navigate("/student/apply")}>Nộp hồ sơ mới</Button>
                    <Button style={{ marginTop: 12 }} block onClick={() => navigate("/student/status")}>Xem tiến độ hồ sơ</Button>
                  </div>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Card>
    </div>
  );
}
