// frontend/src/pages/admin/AdminDashboardPage.tsx
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

  // Modal từ chối
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectAppId, setRejectAppId] = useState<number | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await fetchApplications();
      setApplications(data || []);
    } catch (error: any) {
      message.error(error.message || "Không thể tải danh sách hồ sơ.");
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((item) => {
      const universityMatch = !selectedUniversity || item.university === selectedUniversity;
      const majorMatch = !selectedMajor || item.major === selectedMajor;
      const statusMatch = !selectedStatus || item.status?.toLowerCase() === selectedStatus.toLowerCase();
      return universityMatch && majorMatch && statusMatch;
    });
  }, [applications, selectedUniversity, selectedMajor, selectedStatus]);

  const universityOptions = useMemo(() => 
    Array.from(new Set(applications.map(item => item.university)))
      .filter(Boolean)
      .map(value => ({ value, label: value })), 
  [applications]);

  const majorOptions = useMemo(() => 
    Array.from(new Set(applications.map(item => item.major)))
      .filter(Boolean)
      .map(value => ({ value, label: value })), 
  [applications]);

  const handleUpdateStatus = async (id: number, status: string, rejectReason?: string) => {
    setUpdatingId(id);
    try {
      await updateApplicationStatus(id, status, rejectReason);

      setApplications(prev => 
        prev.map(item => {
          const itemId = item.application_id || item.id;
          if (itemId === id) {
            return { ...item, status, rejection_reason: rejectReason };
          }
          return item;
        })
      );

      message.success(`Hồ sơ đã được ${status === "approved" ? "duyệt" : "từ chối"} thành công`);
      setIsRejectModalOpen(false);
    } catch (error: any) {
      message.error(error.message || "Cập nhật thất bại");
    } finally {
      setUpdatingId(null);
    }
  };

  const openRejectModal = (id: number) => {
    setRejectAppId(id);
    setIsRejectModalOpen(true);
    form.resetFields();
  };

  const columns = [
    { title: "Thí sinh", key: "candidate_name", render: (_: any, record: any) => <strong>{record.candidate_name || record.fullName}</strong> },
    { title: "Trường", dataIndex: "university", key: "university" },
    { title: "Ngành", dataIndex: "major", key: "major" },
    { 
      title: "Trạng thái", 
      dataIndex: "status", 
      key: "status",
      render: (status: string) => {
        const s = status?.toLowerCase();
        return <Tag color={s === "approved" ? "green" : s === "rejected" ? "red" : "orange"}>
          {s === "approved" ? "Đã duyệt" : s === "rejected" ? "Từ chối" : "Chờ duyệt"}
        </Tag>;
      }
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: any) => {
        const id = record.application_id || record.id;
        const isPending = record.status?.toLowerCase() === "pending" || !record.status;

        if (!isPending) return <span style={{ color: "#999" }}>Đã xử lý</span>;

        return (
          <Space>
            <Button 
              type="primary" 
              icon={<CheckOutlined />} 
              onClick={() => handleUpdateStatus(id, "approved")}
              loading={updatingId === id}
            >
              Duyệt
            </Button>
            <Button 
              danger 
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
      <Sider width={240} theme="light">
        <div style={{ margin: "24px 16px", fontWeight: 700, color: "#1890ff", fontSize: "18px", textAlign: "center" }}>
          ADMIN WORKSPACE
        </div>
        <Menu mode="inline" defaultSelectedKeys={["1"]} items={[{ key: "1", label: "Quản lý hồ sơ" }]} />
      </Sider>

      <Layout>
        <Header style={{ background: "#fff", padding: "0 24px", borderBottom: "1px solid #f0f0f0" }}>
          <Title level={4} style={{ margin: "16px 0 0 0" }}>
            Quản lý Hồ sơ Xét tuyển
          </Title>
        </Header>

        <Content style={{ margin: 24 }}>
          <Card>
            <Space wrap style={{ marginBottom: 16 }}>
              <Select allowClear placeholder="Chọn trường" style={{ width: 200 }} options={universityOptions} onChange={setSelectedUniversity} />
              <Select allowClear placeholder="Chọn ngành" style={{ width: 200 }} options={majorOptions} onChange={setSelectedMajor} />
              <Select allowClear placeholder="Trạng thái" style={{ width: 160 }} 
                options={[
                  { value: "pending", label: "Chờ duyệt" },
                  { value: "approved", label: "Đã duyệt" },
                  { value: "rejected", label: "Từ chối" }
                ]} 
                onChange={setSelectedStatus} 
              />
            </Space>

            <Table 
              rowKey={record => record.application_id || record.id}
              loading={loading} 
              dataSource={filteredApplications} 
              columns={columns} 
              bordered 
            />
          </Card>
        </Content>
      </Layout>

      {/* Modal Từ chối */}
      <Modal
        title="Nhập lý do từ chối"
        open={isRejectModalOpen}
        onCancel={() => setIsRejectModalOpen(false)}
        onOk={() => form.submit()}
        okText="Xác nhận từ chối"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <Form form={form} onFinish={(values) => rejectAppId && handleUpdateStatus(rejectAppId, "rejected", values.rejectReason)}>
          <Form.Item name="rejectReason" label="Lý do từ chối" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="Nhập lý do chi tiết..." />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}