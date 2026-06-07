import { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Drawer, Input, message, Row, Select, Space, Table, Tag, Typography, Divider, Alert } from "antd";
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
  const [filterUniversity, setFilterUniversity] = useState<any>(undefined);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectReason, setShowRejectReason] = useState(false);

  useEffect(() => {
    loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterUniversity]);

  async function loadApplications() {
    setLoading(true);
    try {
      const query = {
        status: filterStatus,
        universityId: filterUniversity
      };
      const result = await fetchApplications(query);
      setApplications(result.data || []);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể tải danh sách hồ sơ.");
    } finally {
      setLoading(false);
    }
  }

  const universityOptions = useMemo(() => {
    const optionsMap = new Map<any, string>();
    applications.forEach((item) => {
      if (item.university && item.university_id != null) {
        optionsMap.set(item.university_id, item.university);
      }
    });
    return Array.from(optionsMap.entries()).map(([value, label]) => ({ value, label }));
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
        const meta = statusTags[status?.toLowerCase()] || { color: "default", label: status };
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
    setShowRejectReason(false);
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

  const attachments = selectedApplication?.documents || (selectedApplication?.document_url ? [{ name: "Tài liệu đính kèm", type: "link", url: selectedApplication.document_url }] : []);

  return (
    <div className="page-shell">
      <Card className="page-card" title={<Title level={4} style={{ margin: 0 }}>Quản lý hồ sơ xét tuyển</Title>} style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
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
          onRow={(record) => ({ onClick: () => openDrawer(record) })}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Drawer
        width={1000}
        title="Duyệt hồ sơ xét tuyển"
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        {selectedApplication ? (
          <>
            <Row gutter={32}>
              <Col span={16} style={{ borderRight: "1px solid #f0f0f0", paddingRight: 24 }}>
                <Title level={5}>Thông tin thí sinh & hồ sơ</Title>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Text strong>Họ và tên:</Text> <Text>{selectedApplication.candidate_name}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Email:</Text> <Text>{selectedApplication.candidate_email}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Trường:</Text> <Text>{selectedApplication.university}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Ngành:</Text> <Text>{selectedApplication.major}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Tổ hợp:</Text> <Text>{selectedApplication.subject_group}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Trạng thái:</Text>{" "}
                    <Tag color={statusTags[selectedApplication.status?.toLowerCase()]?.color || "default"}>
                      {statusTags[selectedApplication.status?.toLowerCase()]?.label || selectedApplication.status}
                    </Tag>
                  </Col>
                </Row>

                <Divider />
                <Title level={5}>Điểm xét tuyển</Title>
                <Row gutter={[16, 16]}>
                  {selectedApplication.scores && typeof selectedApplication.scores === "object" ? (
                    Object.entries(selectedApplication.scores).map(([key, value]) => (
                      <Col span={8} key={key}>
                        <Card size="small" style={{ textAlign: "center", background: "#f8fafc", borderRadius: 8 }}>
                          <Text strong>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                          <div style={{ fontSize: 20, color: "#1677ff", fontWeight: "bold" }}>{String(value)}</div>
                        </Card>
                      </Col>
                    ))
                  ) : (
                    <Text type="secondary">Không có dữ liệu điểm.</Text>
                  )}
                </Row>

                <Divider />
                <Title level={5}>Tài liệu đính kèm</Title>
                {attachments.length ? (
                  attachments.map((file: any, index: number) => (
                    <Card key={index} size="small" style={{ marginBottom: 12, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <Text strong>{file.name || `Tài liệu ${index + 1}`}</Text>
                          <div style={{ fontSize: 12, color: "rgba(0,0,0,0.45)" }}>{file.size ? `${file.size} bytes` : "Kích thước không xác định"}</div>
                        </div>
                        {file.url ? (
                          <Button type="link" href={file.url} target="_blank">Xem ngay</Button>
                        ) : (
                          <Tag color="blue">{file.type}</Tag>
                        )}
                      </div>
                    </Card>
                  ))
                ) : (
                  <Alert message="Không có tài liệu đính kèm" type="warning" showIcon style={{ borderRadius: 12 }} />
                )}
              </Col>

              <Col span={8}>
                <Title level={5}>Quyết định</Title>
                <Text type="secondary">Vui lòng kiểm tra kỹ thông tin trước khi duyệt hoặc từ chối hồ sơ.</Text>
                <Button type="primary" size="large" loading={actionLoading && !showRejectReason} onClick={() => handleStatusChange("approved")} style={{ background: "#52c41a", borderColor: "#52c41a", marginTop: 16, width: "100%", borderRadius: 12 }}>
                  Duyệt hồ sơ
                </Button>
                
                {!showRejectReason ? (
                  <Button danger type="primary" size="large" onClick={() => setShowRejectReason(true)} style={{ marginTop: 12, width: "100%", borderRadius: 12 }}>
                    Từ chối hồ sơ
                  </Button>
                ) : (
                  <div style={{ marginTop: 16, padding: 16, background: "#fff1f0", borderRadius: 12, border: "1px solid #ffa39e" }}>
                    <Text type="danger" strong style={{ display: "block", marginBottom: 8 }}>Nhập lý do từ chối (Bắt buộc):</Text>
                    <TextArea rows={4} value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} placeholder="Nhập lý do chi tiết để thông báo cho thí sinh..." style={{ borderRadius: 12 }} />
                    <Space style={{ marginTop: 12, width: "100%", justifyContent: "flex-end" }}>
                      <Button onClick={() => setShowRejectReason(false)} style={{ borderRadius: 12 }}>Hủy</Button>
                      <Button danger type="primary" loading={actionLoading} onClick={() => handleStatusChange("rejected")} style={{ borderRadius: 12 }}>
                        Xác nhận Từ chối
                      </Button>
                    </Space>
                  </div>
                )}
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
