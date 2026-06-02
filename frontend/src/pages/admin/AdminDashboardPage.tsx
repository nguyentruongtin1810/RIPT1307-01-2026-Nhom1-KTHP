import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Layout, Menu, Select, Space, Table, Tag, Typography, message, Modal, Form, Input } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { fetchApplications, updateApplicationStatus } from "../../api/adminApi";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

export default function AdminDashboardPage() {
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  const [selectedMajor, setSelectedMajor] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // State phục vụ Modal từ chối
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectAppId, setRejectAppId] = useState<number | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    async function loadApplications() {
      setLoading(true);
      try {
        const data = await fetchApplications();
        setApplications(data);
      } catch (error: any) {
        message.error(error.message || "Không thể tải danh sách hồ sơ.");
      } finally {
        setLoading(false);
      }
    }
    loadApplications();
  }, []);

  // Bộ lọc dữ liệu phía Client (Tối ưu bằng useMemo)
  const filteredApplications = useMemo(() => {
    return applications.filter((item) => {
      const universityMatch = selectedUniversity ? item.university === selectedUniversity : true;
      const majorMatch = selectedMajor ? item.major === selectedMajor : true;
      
      // Chuyển về chữ thường để so sánh chính xác tuyệt đối không phân biệt hoa thường
      const itemStatus = item.status?.toLowerCase();
      const filterStatus = selectedStatus?.toLowerCase();
      const statusMatch = selectedStatus ? itemStatus === filterStatus : true;
      
      return universityMatch && majorMatch && statusMatch;
    });
  }, [applications, selectedUniversity, selectedMajor, selectedStatus]);

  const universityOptions = useMemo(() => {
    return Array.from(new Set(applications.map((item) => item.university)))
      .filter(Boolean)
      .map((value) => ({ value, label: value }));
  }, [applications]);

  const majorOptions = useMemo(() => {
    return Array.from(new Set(applications.map((item) => item.major)))
      .filter(Boolean)
      .map((value) => ({ value, label: value }));
  }, [applications]);

  // Hàm xử lý chung khi Cập nhật trạng thái
  const handleUpdateStatus = async (id: number, status: string, rejectReason?: string) => {
    setUpdatingId(id);
    try {
      await updateApplicationStatus(id, status, rejectReason);
      
      // Cập nhật State trực tiếp giúp giao diện thay đổi tức thì không cần reload trang
      setApplications((current) =>
        current.map((item) => {
          const itemId = item.application_id || item.id;
          if (itemId === id) {
            return { ...item, status, rejectReason };
          }
          return item;
        })
      );
      
      message.success(`Đã cập nhật trạng thái hồ sơ thành: ${status === "Approved" ? "Đã duyệt" : "Từ chối"}`);
      setIsRejectModalOpen(false);
    } catch (error: any) {
      message.error(error.message || "Không thể cập nhật trạng thái.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Mở giao diện hộp thoại nhập lý do từ chối
  const openRejectModal = (id: number) => {
    setRejectAppId(id);
    setIsRejectModalOpen(true);
    form.resetFields();
  };

  const columns = [
    {
      title: "Thí sinh",
      key: "candidate_name",
      render: (_: any, record: any) => (
        <strong>{record.candidate_name || record.fullName || "Chưa cập nhật"}</strong>
      )
    },
    {
      title: "Trường",
      dataIndex: "university",
      key: "university"
    },
    {
      title: "Ngành",
      dataIndex: "major",
      key: "major"
    },
    {
      title: "Tổng điểm",
      dataIndex: "totalScore",
      key: "totalScore",
      render: (score: any) => <strong style={{ color: "#f5222d" }}>{score || "0.0"}</strong>
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (value: string) => {
        const status = value?.toLowerCase();
        let color = "orange";
        let text = "Chờ xử lý";
        
        if (status === "approved") {
          color = "green";
          text = "Đã duyệt";
        } else if (status === "rejected") {
          color = "red";
          text = "Từ chối";
        }
        
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: any) => {
        const id = record.application_id || record.id;
        const status = record.status?.toLowerCase();
        const isPending = status === "pending" || !status;

        if (!isPending) {
          return <span style={{ color: "#bfbfbf", fontSize: "13px" }}>Đã xử lý xong</span>;
        }

        return (
          <Space>
            <Button 
              type="primary" 
              size="small" 
              icon={<CheckOutlined />}
              style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
              onClick={() => handleUpdateStatus(id, "Approved")} 
              loading={updatingId === id}
            >
              Duyệt
            </Button>
            <Button 
              danger 
              size="small" 
              icon={<CloseOutlined />}
              onClick={() => openRejectModal(id)} 
              loading={updatingId === id}
            >
              Từ chối
            </Button>
          </Space>
        );
      }
    }
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={240} theme="light" style={{ boxShadow: "2px 0 8px rgba(0,0,0,0.05)" }}>
        <div className="logo" style={{ margin: "24px 16px", textAlign: "center", fontWeight: 700, color: "#1890ff", fontSize: "18px" }}>
          ADMIN WORKSPACE
        </div>
        <Menu mode="inline" defaultSelectedKeys={["1"]} items={[{ key: "1", label: "Quản lý hồ sơ" }]} />
      </Sider>
      
      <Layout>
        <Header style={{ background: "#fff", padding: "0 24px", borderBottom: "1px solid #f0f0f0" }}>
          <Title level={4} style={{ margin: "16px 0 0 0" }}>
            Bảng Quản Lý Hồ Sơ Xét Tuyển Học Bạ
          </Title>
        </Header>
        
        <Content style={{ margin: 24 }}>
          <Card bordered={false} style={{ borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            {/* Khu vực chọn Bộ lọc nhanh */}
            <Space wrap style={{ marginBottom: 16 }}>
              <Select
                allowClear
                placeholder="Chọn trường đại học"
                style={{ minWidth: 200 }}
                options={universityOptions}
                onChange={(value) => setSelectedUniversity(value)}
              />
              <Select
                allowClear
                placeholder="Chọn ngành học"
                style={{ minWidth: 200 }}
                options={majorOptions}
                onChange={(value) => setSelectedMajor(value)}
              />
              <Select
                allowClear
                placeholder="Chọn trạng thái"
                style={{ minWidth: 160 }}
                options={[
                  { value: "Pending", label: "Chờ xử lý" },
                  { value: "Approved", label: "Đã duyệt" },
                  { value: "Rejected", label: "Từ chối" }
                ]}
                onChange={(value) => setSelectedStatus(value)}
              />
            </Space>

            <Table
              rowKey={(record) => record.application_id || record.id}
              loading={loading}
              dataSource={filteredApplications}
              columns={columns}
              bordered
            />
          </Card>
        </Content>
      </Layout>

      {/* MODAL POPUP NHẬP LÝ DO TỪ CHỐI */}
      <Modal
        title="Lý do từ chối phê duyệt"
        open={isRejectModalOpen}
        onCancel={() => setIsRejectModalOpen(false)}
        okText="Xác nhận từ chối"
        cancelText="Hủy"
        okButtonProps={{ danger: true, loading: updatingId !== null }}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            if (rejectAppId) {
              handleUpdateStatus(rejectAppId, "Rejected", values.rejectReason);
            }
          }}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="rejectReason"
            label="Nhập lý do cụ thể gửi tới thí sinh:"
            rules={[{ required: true, message: "Vui lòng nhập lý do từ chối hồ sơ!" }]}
          >
            <Input.TextArea rows={4} placeholder="Ví dụ: Ảnh minh chứng học bạ mờ, sai lệch điểm số Toán..." />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}