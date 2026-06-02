import { Card, Row, Col, Statistic, Badge, Space, Typography, Tag, Spin } from "antd";
import { useState, useEffect } from "react";
import { studentApi } from "../../api/candidateApi";

const { Text } = Typography;

export default function StudentDashboard() {
  const [latestApp, setLatestApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentApi.getApplications()
      .then((res: any) => {
        const apps = Array.isArray(res) ? res : res?.data || [];
        if (apps.length > 0) {
          setLatestApp(apps[apps.length - 1]); // Đọc hồ sơ mới nhất để lấy trạng thái thực tế
        }
      })
      .catch(() => console.log("Thí sinh chưa khởi tạo hồ sơ nào"))
      .finally(() => setLoading(false));
  }, []);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED": return <Badge status="success" text="Đã duyệt (APPROVED)" />;
      case "REJECTED": return <Badge status="error" text="Từ chối (REJECTED)" />;
      case "PENDING": return <Badge status="warning" text="Chờ kiểm duyệt (PENDING)" />;
      default: return <Badge status="default" text="Bản nháp sơ bộ (DRAFT)" />;
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" tip="Đang tải dữ liệu tổng quan..." /></div>;

  return (
    <div style={{ padding: "12px", width: "100%", fontFamily: "Inter, sans-serif" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card bordered={false} style={{ borderLeft: "4px solid #3b82f6", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <Statistic title="Đợt tuyển sinh năm 2026" value="Đang mở tự do" valueStyle={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a8a' }} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card bordered={false} style={{ borderLeft: "4px solid #ef4444", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <Statistic title="Hạn chót nộp hồ sơ" value="30/08/2026" valueStyle={{ fontSize: '18px', fontWeight: 'bold', color: '#ef4444' }} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card bordered={false} style={{ borderLeft: "4px solid #eab308", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <Text type="secondary" style={{ fontSize: '14px' }}>Trạng thái hồ sơ hiện tại</Text>
              <div style={{ marginTop: '10px' }}>
                {latestApp ? renderStatusBadge(latestApp.status) : <Tag color="default">Chưa nộp hồ sơ</Tag>}
              </div>
            </Card>
          </Col>
        </Row>
        
        <Card title="Hướng dẫn quy trình xét tuyển học bạ điện tử" bordered={false} style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <Text style={{ fontSize: "14px", lineHeight: "1.6" }}>
            Chào mừng thí sinh đến với Cổng đăng ký thông tin trực tuyến. Hệ thống đã liên kết hoàn toàn với cơ sở dữ liệu Backend. 
            Để thực hiện đăng ký hoặc theo dõi kết quả, vui lòng sử dụng các tính năng tương ứng có sẵn trên <b>Thanh công cụ điều hướng bên trái</b> màn hình (Đăng ký xét tuyển / Theo dõi hồ sơ).
          </Text>
        </Card>
      </Space>
    </div>
  );
}