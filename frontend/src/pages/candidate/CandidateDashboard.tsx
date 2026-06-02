import React from "react";
import { Card, Row, Col, Statistic, Typography } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function CandidateDashboard() {
  return (
    <div style={{ padding: "4px" }}>
      <Title level={3} style={{ marginBottom: "20px" }}>Bảng điều khiển thí sinh</Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <Statistic 
              title="Trạng thái hồ sơ" 
              value="Đang thẩm định" 
              prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />} 
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={16}>
          <Card bordered={false} title="Hướng dẫn quy trình" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            {/* SỬA LỖI TẠI ĐÂY: Thay block bằng display: "block" trong style */}
            <Text style={{ display: "block", marginBottom: "8px" }}>
              • Bước 1: Truy cập mục <strong>Đăng ký xét tuyển</strong> để khai báo thông tin.
            </Text>
            <Text style={{ display: "block" }}>
              • Bước 2: Theo dõi kết quả phê duyệt tại mục <strong>Theo dõi hồ sơ</strong>.
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
}