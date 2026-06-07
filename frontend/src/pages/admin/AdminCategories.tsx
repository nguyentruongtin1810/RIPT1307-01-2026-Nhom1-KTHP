import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  notification,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
  Typography
} from "antd";
import {
  createMajor,
  createUniversity,
  deleteMajor,
  deleteUniversity,
  fetchMajors,
  fetchUniversities,
  updateMajor,
  updateUniversity
} from "../../api/adminApi";

const { Title, Text } = Typography;

type University = {
  id: number;
  code: string;
  name: string;
  logo_url?: string;
};

type Major = {
  id: number;
  code: string;
  name: string;
  quota: number;
  university_id: number;
  university: string;
};

type ModalMode = "create-university" | "edit-university" | "create-major" | "edit-major";

export default function AdminCategories() {
  const [activeKey, setActiveKey] = useState<string>("universities");
  const [universities, setUniversities] = useState<University[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create-university");
  const [selectedRecord, setSelectedRecord] = useState<University | Major | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [universityData, majorData] = await Promise.all([fetchUniversities(), fetchMajors()]);
      setUniversities(universityData || []);
      setMajors(majorData || []);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || "Không thể tải dữ liệu quản lý.";
      notification.error({ message: "Lỗi Hệ Thống", description: errorMsg, duration: 5 });
    } finally {
      setLoading(false);
    }
  }

  const universityOptions = useMemo(
    () => universities.map((u) => ({ label: u.name, value: u.id })),
    [universities]
  );

  const openCreateUniversity = () => {
    setModalMode("create-university");
    setSelectedRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openCreateMajor = () => {
    setModalMode("create-major");
    setSelectedRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditUniversity = (record: University) => {
    setModalMode("edit-university");
    setSelectedRecord(record);
    form.setFieldsValue({ code: record.code, name: record.name, logo_url: record.logo_url });
    setModalOpen(true);
  };

  const openEditMajor = (record: Major) => {
    setModalMode("edit-major");
    setSelectedRecord(record);
    form.setFieldsValue({ code: record.code, name: record.name, quota: record.quota, universityId: record.university_id });
    setModalOpen(true);
  };

  const handleDeleteUniversity = async (id: number) => {
    setLoading(true);
    try {
      await deleteUniversity(id);
      notification.success({ message: "Xóa trường thành công", duration: 4 });
      setUniversities((current) => current.filter((item) => item.id !== id));
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || "Không thể xóa trường.";
      notification.error({ message: "Lỗi Hệ Thống", description: errorMsg, duration: 5 });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMajor = async (id: number) => {
    setLoading(true);
    try {
      await deleteMajor(id);
      notification.success({ message: "Xóa ngành thành công", duration: 4 });
      setMajors((current) => current.filter((item) => item.id !== id));
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || "Không thể xóa ngành.";
      notification.error({ message: "Lỗi Hệ Thống", description: errorMsg, duration: 5 });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (modalMode === "create-university") {
        const created = await createUniversity(values);
        setUniversities((current) => [...current, created]);
        notification.success({ message: "Thêm trường thành công", duration: 4 });
      }

      if (modalMode === "edit-university" && selectedRecord) {
        const updated = await updateUniversity(selectedRecord.id, values);
        setUniversities((current) => current.map((item) => (item.id === selectedRecord.id ? updated : item)));
        notification.success({ message: "Cập nhật trường thành công", duration: 4 });
      }

      if (modalMode === "create-major") {
        const created = await createMajor({ ...values, subjectGroupIds: [] });
        setMajors((current) => [...current, created]);
        notification.success({ message: "Thêm ngành thành công", duration: 4 });
      }

      if (modalMode === "edit-major" && selectedRecord) {
        const updated = await updateMajor(selectedRecord.id, { ...values, subjectGroupIds: [] });
        setMajors((current) => current.map((item) => (item.id === selectedRecord.id ? updated : item)));
        notification.success({ message: "Cập nhật ngành thành công", duration: 4 });
      }

      setModalOpen(false);
      form.resetFields();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      const errorMsg = error.response?.data?.message || error.message || "Unknown error occurred";
      notification.error({ message: "Lỗi Hệ Thống", description: errorMsg, duration: 5 });
    } finally {
      setLoading(false);
    }
  };

  const universityColumns = [
    { title: "Mã trường", dataIndex: "code", key: "code" },
    { title: "Tên trường", dataIndex: "name", key: "name" },
    {
      title: "Logo",
      dataIndex: "logo_url",
      key: "logo_url",
      render: (url: string) => url ? <a href={url} target="_blank" rel="noreferrer">Link</a> : <Text type="secondary">Không có</Text>
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_: any, record: University) => (
        <Space>
          <Button type="link" onClick={() => openEditUniversity(record)}>
            Sửa
          </Button>
          <Popconfirm title="Bạn có chắc muốn xóa trường này?" onConfirm={() => handleDeleteUniversity(record.id)}>
            <Button type="link" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const majorColumns = [
    { title: "Mã ngành", dataIndex: "code", key: "code" },
    { title: "Tên ngành", dataIndex: "name", key: "name" },
    {
      title: "Trường",
      dataIndex: "university",
      key: "university",
      render: (value: string) => <Text>{value}</Text>
    },
    { title: "Chỉ tiêu", dataIndex: "quota", key: "quota" },
    {
      title: "Hành động",
      key: "actions",
      render: (_: any, record: Major) => (
        <Space>
          <Button type="link" onClick={() => openEditMajor(record)}>
            Sửa
          </Button>
          <Popconfirm title="Bạn có chắc muốn xóa ngành này?" onConfirm={() => handleDeleteMajor(record.id)}>
            <Button type="link" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const isUniversityModal = modalMode.includes("university");

  return (
    <div className="page-shell">
      <Card className="page-card" title={<Title level={4}>Quản lý Trường và Ngành</Title>}>
        <Tabs activeKey={activeKey} onChange={(key) => setActiveKey(key)}>
          <Tabs.TabPane tab="Trường" key="universities">
            <Space style={{ marginBottom: 16 }}>
              <Button type="primary" onClick={openCreateUniversity}>
                Thêm trường mới
              </Button>
            </Space>
            <Table
              rowKey="id"
              loading={loading}
              columns={universityColumns}
              dataSource={universities}
              pagination={{ pageSize: 8 }}
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab="Ngành" key="majors">
            <Space style={{ marginBottom: 16 }}>
              <Button type="primary" onClick={openCreateMajor}>
                Thêm ngành mới
              </Button>
            </Space>
            <Table rowKey="id" loading={loading} columns={majorColumns} dataSource={majors} pagination={{ pageSize: 8 }} />
          </Tabs.TabPane>
        </Tabs>
      </Card>

      <Modal
        title={
          modalMode === "create-university"
            ? "Thêm trường mới"
            : modalMode === "edit-university"
            ? "Chỉnh sửa trường"
            : modalMode === "create-major"
            ? "Thêm ngành mới"
            : "Chỉnh sửa ngành"
        }
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item label="Mã" name="code" rules={[{ required: true, message: "Vui lòng nhập mã" }]}> 
            <Input placeholder={isUniversityModal ? "VD: FPTPOLY" : "VD: FPT-IT"} />
          </Form.Item>
          <Form.Item label="Tên" name="name" rules={[{ required: true, message: "Vui lòng nhập tên" }]}> 
            <Input placeholder={isUniversityModal ? "VD: Đại học FPT" : "VD: Công nghệ thông tin"} />
          </Form.Item>

          {isUniversityModal ? (
            <Form.Item label="Logo URL" name="logo_url">
              <Input placeholder="https://..." />
            </Form.Item>
          ) : (
            <>
              <Form.Item label="Trường" name="universityId" rules={[{ required: true, message: "Vui lòng chọn trường" }]}> 
                <Select placeholder="Chọn trường" options={universityOptions} />
              </Form.Item>
              <Form.Item label="Chỉ tiêu" name="quota" rules={[{ required: true, message: "Vui lòng nhập chỉ tiêu" }]}> 
                <Input type="number" min={0} placeholder="Số lượng chỉ tiêu" />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
}
