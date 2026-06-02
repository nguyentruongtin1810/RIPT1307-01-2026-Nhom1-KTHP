import React, { useEffect, useState } from "react";
import { Card, Descriptions, Spin, Tag, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import { getApplicationStatus } from "../../api/candidateApi";
import { getToken, getUserRole } from "../../utils/auth";

const { Title, Text } = Typography;

export default function CandidateTrackingPage() {
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Khấu trừ object map cả hai trường hợp viết hoa và viết thường từ backend trả về
  const statusTag: Record<string, React.ReactNode> = {
    pending: <Tag color="orange">Chờ xử lý</Tag>,
    approved: <Tag color="green">Đã duyệt</Tag>,
    rejected: <Tag color="red">Từ chối</Tag>,
    Pending: <Tag color="orange">Chờ xử lý</Tag>,
    Approved: <Tag color="green">Đã duyệt</Tag>,
    Rejected: <Tag color="red">Từ chối</Tag>
  };

  useEffect(() => {
    // Bảo vệ tuyến đường (Route Guard)
    if (!getToken() || getUserRole() !== "student") {
      navigate("/candidate/login");
      return;
    }

    async function loadApplication() {
      setLoading(true);
      try {
        const data = await getApplicationStatus();
        setApplication(data);
      } catch (error: any) {
        message.error(error.message || "Không thể tải thông tin hồ sơ xét tuyển.");
      } finally {
        setLoading(false);
      }
    }

    loadApplication();
  }, [navigate]);

  const renderStatusTag = (status: string) => {
    if (!status) return <Tag color="default">Chưa rõ</Tag>;
    return statusTag[status] || <Tag color="default">{status}</Tag>;
  };

  return (
    <div style={{ padding: '4px' }}>
      <Card 
        bordered={false} 
        style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        title={<Title level={4} style={{ margin: 0, color: '#1f1f1f' }}>Theo Dõi Tiến Trình Xét Tuyển</Title>}
      >
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <Spin tip="Đang truy vấn dữ liệu hồ sơ..." />
          </div>
        ) : application ? (
          <div>
            {/* SỬA LỖI TẠI ĐÂY: Thay block bằng display: 'block' trong style */}
            {(application.status === 'rejected' || application.status === 'Rejected') && application.rejectReason && (
              <div style={{ backgroundColor: '#fff2f0', border: '1px solid #ffccc7', padding: '12px 16px', borderRadius: '4px', marginBottom: '20px' }}>
                <Text type="danger" strong style={{ display: 'block', marginBottom: '4px' }}>
                  Lý do từ chối phê duyệt:
                </Text>
                <Text type="danger">{application.rejectReason}</Text>
              </div>
            )}

            <Descriptions 
              column={{ xs: 1, sm: 2 }} 
              bordered 
              size="middle"
              labelStyle={{ backgroundColor: '#fafafa', fontWeight: 500, width: '160px' }}
            >
              <Descriptions.Item label="Họ và tên thí sinh" span={{ xs: 1, sm: 2 }}>
                <strong>{application.candidate_name || application.fullName || "Chưa cập nhật"}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ Email">{application.candidate_email || application.email || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Đối tượng ưu tiên">{application.priority || "Không có"}</Descriptions.Item>
              
              <Descriptions.Item label="Trường đăng ký" span={{ xs: 1, sm: 2 }}>{application.university || application.universityName || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Ngành học">{application.major || application.majorName || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Tổ hợp xét tuyển">{application.subject_group || application.subjectGroupId || "N/A"}</Descriptions.Item>
              
              <Descriptions.Item label="Điểm Toán">{application.score_math ?? application.scoreMath ?? "0.0"}</Descriptions.Item>
              <Descriptions.Item label="Điểm Ngữ văn">{application.score_literature ?? application.scoreLiterature ?? "0.0"}</Descriptions.Item>
              <Descriptions.Item label="Điểm Tiếng Anh">{application.score_english ?? application.scoreEnglish ?? "0.0"}</Descriptions.Item>
              
              <Descriptions.Item label="Tổng điểm xét tuyển">
                <Text type="danger" strong style={{ fontSize: '15px' }}>
                  {application.totalScore ?? "0.0"}
                </Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="Trạng thái hồ sơ" span={{ xs: 1, sm: 2 }}>
                {renderStatusTag(application.status)}
              </Descriptions.Item>
            </Descriptions>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <Text type="secondary">Hệ thống chưa tìm thấy hồ sơ đăng ký xét tuyển nào của tài khoản này.</Text>
          </div>
        )}
      </Card>
    </div>
  );
}