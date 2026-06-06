import { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Drawer, Input, message, Row, Select, Space, Statistic, Table, Tag, Typography } from "antd";
import { fetchApplications, changeApplicationStatus } from "../../api/adminApi";

const { Title, Text } = Typography;
const { TextArea } = Input;

const statusTags: Record<string, { color: string; label: string }> = {
  pending: { color: "orange", label: "Chờ xử lý" },
  approved: { color: "green", label: "Đã duyệt" },
  rejected: { color: "red", label: "Từ chối" }
};

export default function AdminApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [filterUniversity, setFilterUniversity] = useState<number | undefined>(undefined);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadApplications();
  }, [filterStatus, filterUniversity]);

  async function loadApplications() {
    setLoading(true);
    try {
      const query = {
        status: filterStatus,
        universityId: filterUniversity
      };
      const applications = await fetchApplications(query);
      setApplications(applications.data || []);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể tải danh sách hồ sơ.");
    } finally {
      setLoading(false);
    }
  }

  const universityOptions = useMemo(() => {
    return Array.from(
      new Map(applications.map((item) => [item.university_id, item.university]))
    ).map(([id, university]) => ({
      label: university,
      value: id
    }));
  }, [applications]);

  const columns = [
    {
      title: "Thí sinh",
      dataIndex: "candidate_name",
      key: "candidate_name",
      sorter: (a: any, b: any) => a.candidate_name.localeCompare(b.candidate_name)
    },
    {
      title: "Ngành",
      dataIndex: "major",
      key: "major"
    },
    {
      title: "Trường",
      dataIndex: "university",
      key: "university"
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const meta = statusTags[status.toLowerCase()] || { color: "default", label: status };
        return <Tag color={meta.color}>{meta.label}</Tag>;
      }
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: any) => (
        <Button type="link" onClick={() => openDrawer(record)}>
          Xem chi tiết
        </Button>
      )
    }
  ];

  function openDrawer(application: any) {
    setSelectedApplication(application);
    setRejectionReason("");
    setDrawerOpen(true);
  }

  async function handleStatusChange(status: "approved" | "rejected") {
    if (!selectedApplication) {
      return;
    }

    if (status === "rejected" && !rejectionReason.trim()) {
      message.error("Vui lòng nhập lý do từ chối.");
      return;
    }

    setActionLoading(true);
    try {
      const updated = await changeApplicationStatus(selectedApplication.id, status, rejectionReason.trim());
      message.success(status === "approved" ? "Đã duyệt hồ sơ." : "Đã từ chối hồ sơ.");
      setSelectedApplication(updated);
      loadApplications();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Cập nhật trạng thái thất bại.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="page-shell">
      <Card className="page-card" title={<Title level={4}>Quản lý hồ sơ xét tuyển</Title>}>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} md={8}>
            <Select
              placeholder="Lọc theo trạng thái"
              allowClear
              value={filterStatus}
              onChange={(value) => setFilterStatus(value)}
              options={[
                { value: "pending", label: "Chờ xử lý" },
                { value: "approved", label: "Đã duyệt" },
                { value: "rejected", label: "Đã từ chối" }
              ]}
              style={{ width: "100%" }}
            />
          </Col>
          <Col xs={24} md={8}>
            <Select
              placeholder="Lọc theo trường"
              allowClear
              value={filterUniversity}
              onChange={(value) => setFilterUniversity(value)}
              options={universityOptions}
              style={{ width: "100%" }}
            />
          </Col>
          <Col xs={24} md={8} style={{ textAlign: "right" }}>
            <Button type="primary" onClick={loadApplications}>
              Làm mới
            </Button>
          </Col>
        </Row>

        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={applications}
          onRow={(record) => ({
            onClick: () => openDrawer(record)
          })}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Drawer
        width={600}
        title="Chi tiết hồ sơ"
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        footer={
          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button onClick={() => setDrawerOpen(false)}>Đóng</Button>
            <Button danger loading={actionLoading} onClick={() => handleStatusChange("rejected")}>Từ chối</Button>
            <Button type="primary" loading={actionLoading} onClick={() => handleStatusChange("approved")}>Duyệt</Button>
          </Space>
        }
      >
        {selectedApplication ? (
          <>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Text strong>Họ và tên:</Text>
                <div>{selectedApplication.candidate_name}</div>
              </Col>
              <Col span={24}>
                <Text strong>Email:</Text>
                <div>{selectedApplication.candidate_email}</div>
              </Col>
              <Col span={12}>
                <Text strong>Trường:</Text>
                <div>{selectedApplication.university}</div>
              </Col>
              <Col span={12}>
                <Text strong>Ngành:</Text>
                <div>{selectedApplication.major}</div>
              </Col>
              <Col span={12}>
                <Text strong>Tổ hợp:</Text>
                <div>{selectedApplication.subject_group}</div>
              </Col>
              <Col span={12}>
                <Text strong>Trạng thái:</Text>
                <div>
                  <Tag color={statusTags[selectedApplication.status?.toLowerCase()]?.color || "default"}>
                    {statusTags[selectedApplication.status?.toLowerCase()]?.label || selectedApplication.status}
                  </Tag>
                </div>
              </Col>
              <Col span={24}>
                <Text strong>Điểm:</Text>
                <div style={{ marginTop: 8 }}>
                  {selectedApplication.scores && typeof selectedApplication.scores === "object" ? (
                    Object.entries(selectedApplication.scores).map(([key, value]) => (
                      <div key={key} style={{ marginBottom: 6 }}>
                        <Text>{key.replace(/score/i, "").toUpperCase()}: </Text>
                        <Text>{String(value)}</Text>
                      </div>
                    ))
                  ) : (
                    <Text type="secondary">Không có dữ liệu điểm.</Text>
                  )}
                </div>
              </Col>
              <Col span={24}>
                <Text strong>Hồ sơ tài liệu:</Text>
                <div style={{ marginTop: 8 }}>
                  {selectedApplication.document_url ? (
                    <Card size="small" style={{ marginBottom: 12 }}>
                      <a href={selectedApplication.document_url} target="_blank" rel="noreferrer">
                        Xem tài liệu đã tải lên
                      </a>
                    </Card>
                  ) : (
                    <Text type="secondary">Không có tài liệu xem trước.</Text>
                  )}
                </div>
              </Col>
              <Col span={24}>
                <Text strong>Lý do từ chối</Text>
                <TextArea
                  rows={4}
                  value={rejectionReason}
                  onChange={(event) => setRejectionReason(event.target.value)}
                  placeholder="Nhập lý do từ chối nếu cần"
                />
              </Col>
            </Row>
          </>
        ) : (
          <Text>Chọn hồ sơ để xem chi tiết.</Text>
        )}
      </Drawer>
    </div>
  );
}
