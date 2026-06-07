import { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Drawer, Input, message, Row, Select, Space, Image, Table, Tag, Typography, Divider } from "antd";
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
        width={1000}
        title="Duyệt Hồ Sơ Xét Tuyển (Review Center)"
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        {selectedApplication ? (
          <>
            <Row gutter={32}>
              <Col span={16} style={{ borderRight: "1px solid #f0f0f0", paddingRight: 24 }}>
                <Title level={5}>Thông tin Thí sinh & Hồ sơ</Title>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Text strong>Họ và tên: </Text> <Text>{selectedApplication.candidate_name}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Email: </Text> <Text>{selectedApplication.candidate_email}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Trường: </Text> <Text>{selectedApplication.university}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Ngành: </Text> <Text>{selectedApplication.major}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Tổ hợp: </Text> <Text>{selectedApplication.subject_group}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Trạng thái hiện tại: </Text>
                    <Tag color={statusTags[selectedApplication.status?.toLowerCase()]?.color || "default"}>
                      {statusTags[selectedApplication.status?.toLowerCase()]?.label || selectedApplication.status}
                    </Tag>
                  </Col>
                </Row>
                <Divider />
                <Title level={5}>Điểm Xét Tuyển</Title>
                <Row gutter={[16, 16]}>
                  {selectedApplication.scores && typeof selectedApplication.scores === "object" ? (
                    Object.entries(selectedApplication.scores).map(([key, value]) => (
                      <Col span={8} key={key}>
                        <Card size="small" style={{ textAlign: "center", background: "#f8fafc" }}>
                          <Text strong>{key.replace(/score/i, "").toUpperCase()}</Text>
                          <div style={{ fontSize: 20, color: "#1677ff", fontWeight: "bold" }}>{String(value)}</div>
                        </Card>
                      </Col>
                    ))
                  ) : (
                    <Text type="secondary">Không có dữ liệu điểm.</Text>
                  )}
                </Row>
                <Divider />
                <Title level={5}>Ảnh Minh Chứng (Tài liệu)</Title>
                <div style={{ marginTop: 8 }}>
                  {selectedApplication.document_url ? (
                    <Image width="100%" style={{ borderRadius: 8, maxHeight: 400, objectFit: "cover" }} src={selectedApplication.document_url} alt="Tài liệu chứng minh" />
                  ) : (
                    <Card style={{ textAlign: "center", padding: "20px" }}><Text type="secondary">Không có ảnh tài liệu.</Text></Card>
                  )}
                </div>
              </Col>
              
              <Col span={8}>
                <Title level={5}>Khu Vực Phê Duyệt</Title>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <Text strong>Lý do từ chối (bắt buộc nếu từ chối):</Text>
                    <TextArea rows={6} style={{ marginTop: 8 }} value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} placeholder="Nhập lý do thí sinh bị từ chối hồ sơ..." />
                  </div>
                  <Button type="primary" size="large" loading={actionLoading} onClick={() => handleStatusChange("approved")} style={{ background: "#52c41a", borderColor: "#52c41a", width: "100%" }}>
                    Duyệt Hồ Sơ
                  </Button>
                  <Button danger type="primary" size="large" loading={actionLoading} onClick={() => handleStatusChange("rejected")} style={{ width: "100%" }}>
                    Từ Chối Hồ Sơ
                  </Button>
                </div>
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
