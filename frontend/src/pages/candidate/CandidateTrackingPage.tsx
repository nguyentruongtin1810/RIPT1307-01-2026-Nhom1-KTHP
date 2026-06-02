import { Card, Timeline, Typography, Empty, Spin } from "antd";
import { useState, useEffect } from "react";
import { CheckCircleOutlined, SyncOutlined, ClockCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { studentApi } from "../../api/candidateApi";

const { Text } = Typography;

export default function TrackApplication() {
  const [latestApp, setLatestApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentApi.getApplications()
      .then((res: any) => {
        const apps = Array.isArray(res) ? res : res?.data || [];
        if (apps.length > 0) {
          setLatestApp(apps[apps.length - 1]);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const generateTimeline = (status: string) => {
    const steps = [
      {
        children: 'Thí sinh khởi tạo hồ sơ trực tuyến thành công dưới dạng bản nháp (DRAFT)',
        color: 'green',
        dot: <CheckCircleOutlined style={{ fontSize: '16px' }} />
      }
    ];

    if (status === "DRAFT") {
      steps.push({
        children: 'Hồ sơ chưa được gửi đi. Vui lòng hoàn thiện nguyện vọng và bấm Nộp đơn chính thức.',
        color: 'gray',
        dot: <ClockCircleOutlined style={{ fontSize: '16px' }} />
      });
      return steps;
    }

    steps.push({
      children: 'Hệ thống ghi nhận trạng thái nộp thành công (PENDING). Đang chờ Hội đồng khảo sát điểm.',
      color: status === "PENDING" ? "blue" : "green",
      dot: status === "PENDING" ? <SyncOutlined spin style={{ fontSize: '16px' }} /> : <CheckCircleOutlined style={{ fontSize: '16px' }} />
    });

    if (status === "APPROVED") {
      steps.push({
        children: 'Chúc mừng! Bạn đã được phê duyệt trúng tuyển chính thức (APPROVED) vào ngành học.',
        color: 'green',
        dot: <CheckCircleOutlined style={{ fontSize: '16px' }} />
      });
    } else if (status === "REJECTED") {
      steps.push({
        children: 'Hồ sơ xét tuyển bị từ chối duyệt (REJECTED) do không đáp ứng đủ điều kiện hoặc thông tin sai lệch.',
        color: 'red',
        dot: <CloseCircleOutlined style={{ fontSize: '16px' }} />
      });
    }

    return steps;
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" tip="Đang truy xuất trạng thái..." /></div>;

  return (
    <div style={{ padding: "12px", width: "100%" }}>
      <Card bordered={false} title="TIẾN TRÌNH KHẢO SÁT VÀ PHÊ DUYỆT HỒ SƠ" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        {latestApp ? (
          <div style={{ maxWidth: "500px", margin: "32px auto" }}>
            <Timeline mode="left" items={generateTimeline(latestApp.status)} />
          </div>
        ) : (
          <Empty description="Tài khoản này hiện tại chưa có bất kỳ dữ liệu hồ sơ đăng ký nào." />
        )}
      </Card>
    </div>
  );
}