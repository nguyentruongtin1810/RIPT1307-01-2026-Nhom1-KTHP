import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Badge, Timeline, Typography, Divider, Spin, message, Progress } from 'antd';
import { 
  UserOutlined, TrophyOutlined, ClockCircleOutlined, 
  FileTextOutlined, CheckCircleOutlined 
} from '@ant-design/icons';
import { candidateApi } from '../../api/candidateApi';

const { Title, Text } = Typography;

interface Application {
  id: number;
  major: { name: string; university: { name: string } };
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at?: string;
}

const CandidateDashboard: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await candidateApi.getApplications();
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error("Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const latestApp = applications.length > 0 ? applications[0] : null;
  const approvedCount = applications.filter(a => a.status === 'approved').length;
  const pendingCount = applications.filter(a => a.status === 'pending').length;

  const getStatusColor = (status: string) => {
    if (status === 'approved') return '#52c41a';
    if (status === 'rejected') return '#f5222d';
    return '#faad14';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Xin chào, {latestApp ? "Thí sinh" : "Bạn"}! 👋
          </Title>
          <Text type="secondary">Chúc bạn một ngày học tập hiệu quả</Text>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Text strong>Đợt xét tuyển:</Text><br />
          <Text type="success" strong>ĐỢT 1 - 2026</Text>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {/* Card 1: Trạng thái hồ sơ */}
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ height: '100%', borderRadius: 12 }}>
            <Statistic
              title="Trạng thái hồ sơ"
              value={latestApp ? (latestApp.status === 'approved' ? "Đã duyệt" : latestApp.status === 'rejected' ? "Từ chối" : "Chờ duyệt") : "Chưa nộp"}
              valueStyle={{ color: latestApp ? getStatusColor(latestApp.status) : '#999' }}
              prefix={<FileTextOutlined />}
            />
            {latestApp && (
              <Badge 
                status={latestApp.status === 'approved' ? "success" : latestApp.status === 'rejected' ? "error" : "processing"} 
                text={latestApp.major?.name} 
              />
            )}
          </Card>
        </Col>

        {/* Card 2: Số hồ sơ đã nộp */}
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

        {/* Card 3: Đã duyệt */}
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

        {/* Card 4: Hạn nộp */}
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
        {/* Timeline hồ sơ gần đây */}
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
                {applications.slice(0, 4).map((app, index) => (
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
                      Nộp lúc: {new Date(app.created_at).toLocaleDateString('vi-VN')}
                    </Text>
                  </Timeline.Item>
                ))}
              </Timeline>
            )}
          </Card>
        </Col>

        {/* Hướng dẫn & Lưu ý */}
        <Col xs={24} lg={8}>
          <Card title="Hướng dẫn nhanh" style={{ height: '100%' }}>
            <div style={{ lineHeight: '2.4' }}>
              <p><strong>1.</strong> Chọn <strong>"Nộp hồ sơ xét tuyển"</strong> để bắt đầu.</p>
              <p><strong>2.</strong> Chọn Trường → Ngành → Tổ hợp và nhập điểm thi.</p>
              <p><strong>3.</strong> Upload học bạ và CCCD ở bước cuối.</p>
              <p><strong>4.</strong> Theo dõi kết quả tại trang "Theo dõi hồ sơ".</p>
            </div>

            <Divider />
            
            <Card type="inner" size="small" title="💡 Lưu ý quan trọng">
              <ul style={{ paddingLeft: 16, margin: 0 }}>
                <li>Điểm số phải chính xác theo kết quả thi thật.</li>
                <li>Hồ sơ sau khi nộp sẽ không thể chỉnh sửa.</li>
                <li>Kết quả sẽ được thông báo qua email và dashboard.</li>
              </ul>
            </Card>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CandidateDashboard;  