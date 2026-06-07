import { Card, Descriptions, Spin, Tag, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApplicationStatus } from "../../api/candidateApi";
import { getToken, getUserRole } from "../../utils/auth";

const { Title } = Typography;

export default function CandidateTrackingPage() {
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  type ApplicationStatus = "pending" | "approved" | "rejected";

  const statusTag: Record<ApplicationStatus, React.ReactNode> = {
    pending: <Tag color="orange">Chờ xử lý</Tag>,
    approved: <Tag color="green">Đã duyệt</Tag>,
    rejected: <Tag color="red">Từ chối</Tag>
  };

  useEffect(() => {
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
        if (error.response?.data?.message) {
          message.error(error.response.data.message);
        } else {
          message.error("Không thể tải thông tin hồ sơ.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadApplication();
  }, [navigate]);

  return (
    <div className="page-shell">
      <Card className="page-card" title={<Title level={4}>Theo dõi hồ sơ xét tuyển</Title>}>
        {loading ? (
          <Spin />
        ) : application ? (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Họ và tên">{application.candidate_name}</Descriptions.Item>
            <Descriptions.Item label="Email">{application.candidate_email}</Descriptions.Item>
            <Descriptions.Item label="Trường">{application.university}</Descriptions.Item>
            <Descriptions.Item label="Ngành">{application.major}</Descriptions.Item>
            <Descriptions.Item label="Tổ hợp">{application.subject_group}</Descriptions.Item>
            <Descriptions.Item label="Điểm Toán">{application.scores?.math ?? "-"}</Descriptions.Item>
            <Descriptions.Item label="Điểm Ngữ văn">{application.scores?.literature ?? "-"}</Descriptions.Item>
            <Descriptions.Item label="Điểm Tiếng Anh">{application.scores?.english ?? "-"}</Descriptions.Item>
            <Descriptions.Item label="Tổng điểm">{typeof application.scores === "object" ? [application.scores.math, application.scores.literature, application.scores.english].filter((v) => typeof v === "number").reduce((sum, value) => sum + value, 0) : "-"}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">{statusTag[application.status as ApplicationStatus] ?? <Tag>Không xác định</Tag>}</Descriptions.Item>
          </Descriptions>
        ) : (
          <Typography.Text>Không có hồ sơ để hiển thị.</Typography.Text>
        )}
      </Card>
    </div>
  );
}
