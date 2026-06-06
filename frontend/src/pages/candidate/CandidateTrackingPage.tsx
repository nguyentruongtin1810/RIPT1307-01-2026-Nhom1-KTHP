import React, { useEffect, useState } from 'react';
import { 
  Card, Timeline, Badge, Typography, Spin, message, 
  Row, Col, Button, Tag, Divider 
} from 'antd';
import { 
  ClockCircleOutlined, CheckCircleOutlined, 
  CloseCircleOutlined, ReloadOutlined, FileTextOutlined 
} from '@ant-design/icons';
import { candidateApi } from '../../api/candidateApi';

const { Title, Text } = Typography;

interface Application {
  id: number;

  university: string;

  major: string;

  subject_group: string;

  status: string;

  created_at: string;

  updated_at: string;

  rejection_reason?: string;

  document_url?: string;
}

const CandidateTrackingPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrackingData();
  }, []);

  const fetchTrackingData = async () => {
    try {
      setLoading(true);
      const data = await candidateApi.getApplications();
      setApplications(
  data
    ? [data]
    : []
);
    } catch (error) {
      message.error("Không thể tải dữ liệu theo dõi hồ sơ.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return { color: 'green', icon: <CheckCircleOutlined />, text: 'ĐÃ DUYỆT', badge: 'success' };
      case 'rejected':
        return { color: 'red', icon: <CloseCircleOutlined />, text: 'TỪ CHỐI', badge: 'error' };
      default:
        return { color: 'blue', icon: <ClockCircleOutlined />, text: 'CHỜ DUYỆT', badge: 'processing' };
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3}>Theo dõi tiến độ hồ sơ</Title>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={fetchTrackingData}
          loading={loading}
          size="large"
        >
          Làm mới
        </Button>
      </div>

      {loading ? (
        <Spin size="large" tip="Đang tải hồ sơ..." style={{ width: '100%', padding: '100px 0' }} />
      ) : applications.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '80px 20px' }}>
          <FileTextOutlined style={{ fontSize: 60, color: '#d9d9d9' }} />
          <Title level={4} style={{ color: '#999', marginTop: 20 }}>Chưa có hồ sơ nào</Title>
          <Text type="secondary">Hãy nộp hồ sơ xét tuyển để theo dõi tiến độ tại đây</Text>
        </Card>
      ) : (
        <Row gutter={[16, 24]}>
          {applications.map((app) => {
            const statusInfo = getStatusInfo(app.status);
            
            return (
              <Col xs={24} key={app.id}>
                <Card 
                  title={
                    <div>
                      <strong>
  {app.university || "Chưa có trường"}
</strong> — {app.major  || "Chưa có ngành"}
                      <Tag color={statusInfo.badge} style={{ float: 'right', marginTop: 4 }}>
                        {statusInfo.text}
                      </Tag>
                    </div>
                  }
                  extra={
                    <Text type="secondary">
                      Nộp ngày: {new Date(app.created_at).toLocaleDateString('vi-VN')}
                    </Text>
                  }
                >
                  <Timeline mode="left">
                    <Timeline.Item 
                      color="blue" 
                      dot={<ClockCircleOutlined style={{ fontSize: '18px' }} />}
                    >
                      <strong>Đã nộp hồ sơ</strong>
                      <p style={{ margin: '4px 0', color: '#666' }}>
                        {new Date(app.created_at).toLocaleString('vi-VN')}
                      </p>
                      <p>Tổ hợp: <strong>{app.subject_group} - {app.subject_group}</strong></p>
                    </Timeline.Item>

                    <Timeline.Item 
                      color={app.status === 'pending' ? 'blue' : 'gray'}
                      dot={<ClockCircleOutlined style={{ fontSize: '18px' }} />}
                    >
                      <strong>Đang thẩm định hồ sơ</strong>
                      <p style={{ color: '#666' }}>Hội đồng tuyển sinh đang xem xét hồ sơ của bạn</p>
                    </Timeline.Item>

                    <Timeline.Item 
                      color={statusInfo.color}
                      dot={statusInfo.icon}
                    >
                      <strong>Kết quả chính thức: {statusInfo.text}</strong>
                      {app.status === 'rejected' && app.rejection_reason && (
                        <p style={{ color: 'red', marginTop: 8, fontStyle: 'italic' }}>
                          Lý do: {app.rejection_reason}
                        </p>
                      )}
                      {app.status === 'approved' && (
                        <p style={{ color: '#52c41a', fontWeight: 500 }}>
                          Chúc mừng! Hồ sơ của bạn đã được chấp nhận.
                        </p>
                      )}
                      <p style={{ marginTop: 12, fontSize: '13px', color: '#888' }}>
                        Cập nhật: {new Date(app.updated_at).toLocaleString('vi-VN')}
                      </p>
                    </Timeline.Item>
                  </Timeline>

                  {app.document_url && (
                    <Button type="link" href={app.document_url} target="_blank">
                      📄 Xem tài liệu đã nộp
                    </Button>
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};

export default CandidateTrackingPage;