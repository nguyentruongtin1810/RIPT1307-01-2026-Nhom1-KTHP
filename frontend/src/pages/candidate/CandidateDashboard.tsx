import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Badge, Timeline, Typography, Divider, Spin, message, Progress, Avatar } from 'antd';
import { 
  UserOutlined, ClockCircleOutlined, FileTextOutlined, CheckCircleOutlined 
} from '@ant-design/icons';
import { candidateApi } from '../../api/candidateApi';

const { Title, Text } = Typography;

interface Application {
  id: number;
  major?: { name: string; university?: { name: string } };
  status?: 'pending' | 'approved' | 'rejected';
  created_at?: string;
}

const CandidateDashboard: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const data = await candidateApi.getApplications().catch((err) => {
        console.error("Get applications error:", err);
        return []; // Trả về mảng rỗng nếu lỗi (bao gồm 404)
      });
      
      let apps: Application[] = [];
      if (Array.isArray(data)) {
        apps = data;
      } else if (data) {
        apps = [data];
      }
      
      setApplications(apps);

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUserProfile(JSON.parse(storedUser));
      }

    } catch (error: any) {
      console.error("Dashboard error:", error);
      // Chỉ hiện lỗi thật sự nghiêm trọng, không hiện khi chưa có hồ sơ
      if (!error.message?.includes("404") && !error.message?.includes("not found")) {
        message.error("Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fullName = userProfile?.fullName || userProfile?.username || userProfile?.name || "Bạn";

  const latestApp = applications.length > 0 ? applications[0] : null;
  const approvedCount = applications.filter(a => a.status === 'approved').length;

  const getStatusColor = (status?: string) => {
    if (status === 'approved') return '#52c41a';
    if (status === 'rejected') return '#f5222d';
    return '#faad14';
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Avatar size={48} icon={<UserOutlined />} />
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Xin chào, {fullName}! 👋
            </Title>
            <Text type="secondary">Chúc bạn một ngày học tập hiệu quả</Text>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Text strong>Đợt xét tuyển:</Text><br />
          <Text type="success" strong>ĐỢT 1 - 2026</Text>
        </div>
      </div>

      {/* Các card và phần còn lại giữ nguyên như file của bạn */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ height: '100%', borderRadius: 12 }}>
            <Statistic
              title="Trạng thái hồ sơ"
              value={latestApp ? (latestApp.status === 'approved' ? "Đã duyệt" : latestApp.status === 'rejected' ? "Từ chối" : "Chờ duyệt") : "Chưa nộp"}
              valueStyle={{ color: latestApp ? getStatusColor(latestApp.status) : '#999' }}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ height: '100%', borderRadius: 12 }}>
            <Statistic
              title="Hồ sơ đã nộp"
              value={applications.length}
              suffix="hồ sơ"
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Progress percent={applications.length > 0 ? 100 : 0} showInfo={false} strokeColor="#1890ff" />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ height: '100%', borderRadius: 12 }}>
            <Statistic
              title="Hồ sơ đã duyệt"
              value={approvedCount}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Text type="success">Chúc mừng những kết quả tốt đẹp!</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ height: '100%', borderRadius: 12, background: 'linear-gradient(135deg, #fff7e6, #fffbe6)' }}>
            <Statistic
              title="Hạn nộp hồ sơ"
              value="15/08/2026"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
            <Text type="warning" strong>Còn 72 ngày</Text>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card 
            title="Tiến trình hồ sơ gần đây" 
            extra={<a onClick={fetchDashboardData} style={{ cursor: 'pointer' }}>Làm mới</a>}
          >
            {loading ? (
              <Spin size="large" tip="Đang tải..." style={{ width: '100%', padding: '60px 0' }} />
            ) : applications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <Text type="secondary" style={{ fontSize: 16 }}>
                  Bạn chưa có hồ sơ nào.<br />Hãy bắt đầu nộp hồ sơ xét tuyển ngay!
                </Text>
              </div>
            ) : (
              <Timeline mode="left">
                {applications.slice(0, 4).map((app) => (
                  <Timeline.Item 
                    key={app.id}
                    color={app.status === 'approved' ? 'green' : app.status === 'rejected' ? 'red' : 'blue'}
                  >
                    <p><strong>{app.major?.university?.name} - {app.major?.name}</strong></p>
                    <p style={{ margin: '4px 0' }}>
                      {app.status === 'approved' && <Badge status="success" text="ĐÃ DUYỆT" />}
                      {app.status === 'rejected' && <Badge status="error" text="TỪ CHỐI" />}
                      {app.status === 'pending' && <Badge status="processing" text="CHỜ DUYỆT" />}
                    </p>
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                      Nộp lúc: {new Date(app.created_at || Date.now()).toLocaleDateString('vi-VN')}
                    </Text>
                  </Timeline.Item>
                ))}
              </Timeline>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Hướng dẫn nhanh" style={{ height: '100%' }}>
            <div style={{ lineHeight: '2.4' }}>
              <p><strong>1.</strong> Chọn <strong>"Nộp hồ sơ xét tuyển"</strong> để bắt đầu.</p>
              <p><strong>2.</strong> Chọn Trường → Ngành → Tổ hợp và nhập điểm thi.</p>
              <p><strong>3.</strong> Upload học bạ và CCCD ở bước cuối.</p>
              <p><strong>4.</strong> Theo dõi kết quả tại trang "Theo dõi hồ sơ".</p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CandidateDashboard;