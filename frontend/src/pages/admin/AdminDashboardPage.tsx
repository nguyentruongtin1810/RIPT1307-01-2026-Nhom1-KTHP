import { Button, Card, Layout, Menu, Select, Space, Table, Tag, Typography, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { fetchApplications, changeApplicationStatus } from "../../api/adminApi";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

export default function AdminDashboardPage() {
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  const [selectedMajor, setSelectedMajor] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    async function loadApplications() {
      setLoading(true);
      try {
        const data = await fetchApplications();
        setApplications(data);
      } catch (error: any) {
        if (error.response?.data?.message) {
          message.error(error.response.data.message);
        } else {
          message.error("Không thể tải danh sách hồ sơ.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, []);

  const filteredApplications = useMemo(() => {
    return applications.filter((item) => {
      const universityMatch = selectedUniversity ? item.university === selectedUniversity : true;
      const majorMatch = selectedMajor ? item.major === selectedMajor : true;
      const statusMatch = selectedStatus ? item.status === selectedStatus : true;
      return universityMatch && majorMatch && statusMatch;
    });
  }, [applications, selectedUniversity, selectedMajor, selectedStatus]);

  const universityOptions = useMemo(() => {
    return Array.from(new Set(applications.map((item) => item.university))).map((value) => ({ value, label: value }));
  }, [applications]);

  const majorOptions = useMemo(() => {
    return Array.from(new Set(applications.map((item) => item.major))).map((value) => ({ value, label: value }));
  }, [applications]);

  const updateStatus = async (id: number, status: string) => {
    setUpdatingId(id);
    try {
      const updated = await changeApplicationStatus(id, status.toLowerCase());
      setApplications((current) =>
        current.map((item) => (item.application_id === id ? updated : item))
      );
      message.success("Cập nhật trạng thái thành công.");
    } catch (error: any) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error("Không thể cập nhật trạng thái.");
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const columns = [
    {
      title: "Thí sinh",
      dataIndex: "candidate_name",
      key: "candidate_name"
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
      key: "totalScore"
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (value: string) => {
        const color = value === "Approved" ? "green" : value === "Rejected" ? "red" : "orange";
        return <Tag color={color}>{value === "Pending" ? "Chờ xử lý" : value === "Approved" ? "Đã duyệt" : "Từ chối"}</Tag>;
      }
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: any) => (
        <Space>
          <Button type="primary" size="small" onClick={() => updateStatus(record.application_id, "Approved")} loading={updatingId === record.application_id}>
            Duyệt
          </Button>
          <Button danger size="small" onClick={() => updateStatus(record.application_id, "Rejected")} loading={updatingId === record.application_id}>
            Từ chối
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={240} theme="light">
        <div className="logo" style={{ margin: 24, textAlign: "center", fontWeight: 700 }}>
          Admin Panel
        </div>
        <Menu mode="inline" defaultSelectedKeys={["1"]} items={[{ key: "1", label: "Quản lý hồ sơ" }]} />
      </Sider>
      <Layout>
        <Header style={{ background: "#fff", padding: "0 24px" }}>
          <Title level={4} style={{ margin: 0 }}>
            Bảng quản lý hồ sơ xét tuyển
          </Title>
        </Header>
        <Content style={{ margin: 24 }}>
          <Card>
            <Space wrap style={{ marginBottom: 16 }}>
              <Select
                allowClear
                placeholder="Chọn trường"
                style={{ minWidth: 160 }}
                options={universityOptions}
                onChange={(value) => setSelectedUniversity(value)}
              />
              <Select
                allowClear
                placeholder="Chọn ngành"
                style={{ minWidth: 160 }}
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
              rowKey="application_id"
              loading={loading}
              dataSource={filteredApplications}
              columns={columns}
            />
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
}
