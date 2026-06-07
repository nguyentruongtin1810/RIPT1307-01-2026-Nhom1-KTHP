import { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Form, Input, Modal, Row, Select, Space, Table, Typography, message, Tabs, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  fetchUniversities,
  createUniversity,
  updateUniversity,
  deleteUniversity,
  fetchMajors,
  createMajor,
  updateMajor,
  deleteMajor,
  fetchSubjectGroups,
  createSubjectGroup,
  updateSubjectGroup,
  deleteSubjectGroup
} from "../../api/adminApi";

const { Title, Text } = Typography;

const tabItems = [
  { key: "universities", label: "Trường Đại học" },
  { key: "majors", label: "Ngành đào tạo" },
  { key: "subjectGroups", label: "Tổ hợp xét tuyển" }
];

export default function AdminCategories() {
  const [activeTab, setActiveTab] = useState("universities");
  const [universities, setUniversities] = useState<any[]>([]);
  const [majors, setMajors] = useState<any[]>([]);
  const [subjectGroups, setSubjectGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [universitiesData, majorsData, subjectGroupsData] = await Promise.all([
        fetchUniversities(),
        fetchMajors(),
        fetchSubjectGroups()
      ]);
      setUniversities(universitiesData || []);
      setMajors(majorsData || []);
      setSubjectGroups(subjectGroupsData || []);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể tải dữ liệu danh mục.");
    } finally {
      setLoading(false);
    }
  }

  const universityOptions = useMemo(
    () => universities.map((item) => ({ label: item.name, value: item.id })),
    [universities]
  );

  const subjectGroupOptions = useMemo(
    () => subjectGroups.map((item) => ({ label: `${item.code} - ${item.name}`, value: item.id })),
    [subjectGroups]
  );

  const majorColumns = [
    { title: "Mã ngành", dataIndex: "code", key: "code" },
    { title: "Tên ngành", dataIndex: "name", key: "name" },
    {
      title: "Trường",
      dataIndex: "university_name",
      key: "university_name",
      render: (_: any, record: any) => {
        const university = universities.find((item) => item.id === record.university_id);
        return university?.name || "-";
      }
    },
    {
      title: "Tổ hợp",
      dataIndex: "subjectGroupIds",
      key: "subjectGroupIds",
      render: (subjectGroupIds: number[]) =>
        subjectGroupIds?.length ? (
          subjectGroupIds.map((groupId) => {
            const group = subjectGroups.find((item) => item.id === groupId);
            return group ? <Tag key={groupId}>{group.code}</Tag> : null;
          })
        ) : (
          <Text type="secondary">Chưa cập nhật</Text>
        )
    },
    {
      title: "Quota",
      dataIndex: "quota",
      key: "quota"
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            Sửa
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete("major", record.id)}>
            Xóa
          </Button>
        </Space>
      )
    }
  ];

  const universityColumns = [
    { title: "Mã trường", dataIndex: "code", key: "code" },
    { title: "Tên trường", dataIndex: "name", key: "name" },
    { title: "Logo URL", dataIndex: "logo_url", key: "logo_url" },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            Sửa
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete("university", record.id)}>
            Xóa
          </Button>
        </Space>
      )
    }
  ];

  const subjectGroupColumns = [
    { title: "Mã tổ hợp", dataIndex: "code", key: "code" },
    { title: "Tên tổ hợp", dataIndex: "name", key: "name" },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            Sửa
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete("subjectGroup", record.id)}>
            Xóa
          </Button>
        </Space>
      )
    }
  ];

  function openEditModal(record: any) {
    setEditingItem(record);
    form.setFieldsValue({
      code: record.code,
      name: record.name,
      logoUrl: record.logo_url,
      quota: record.quota,
      universityId: record.university_id,
      subjectGroupIds: record.subjectGroupIds || []
    });
    setModalOpen(true);
  }

  function openCreateModal() {
    setEditingItem(null);
    form.resetFields();
    setModalOpen(true);
  }

  async function handleDelete(type: string, id: number) {
    try {
      if (type === "university") await deleteUniversity(id);
      if (type === "major") await deleteMajor(id);
      if (type === "subjectGroup") await deleteSubjectGroup(id);
      message.success("Xóa thành công.");
      loadAll();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Xóa thất bại.");
    }
  }

  async function handleModalSubmit(values: any) {
    try {
      if (activeTab === "universities") {
        if (editingItem) {
          await updateUniversity(editingItem.id, { code: values.code, name: values.name, logoUrl: values.logoUrl });
        } else {
          await createUniversity({ code: values.code, name: values.name, logoUrl: values.logoUrl });
        }
      }
      if (activeTab === "majors") {
        const payload = {
          code: values.code,
          name: values.name,
          quota: Number(values.quota) || 0,
          universityId: values.universityId,
          subjectGroupIds: values.subjectGroupIds || []
        };
        if (editingItem) {
          await updateMajor(editingItem.id, payload);
        } else {
          await createMajor(payload);
        }
      }
      if (activeTab === "subjectGroups") {
        if (editingItem) {
          await updateSubjectGroup(editingItem.id, { code: values.code, name: values.name });
        } else {
          await createSubjectGroup({ code: values.code, name: values.name });
        }
      }
      message.success("Lưu danh mục thành công.");
      setModalOpen(false);
      loadAll();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lưu thất bại.");
    }
  }

  const currentData = activeTab === "universities" ? universities : activeTab === "majors" ? majors : subjectGroups;

  return (
    <div className="page-shell">
      <Card className="page-card" title={<Title level={4}>Quản lý Trường / Ngành / Tổ hợp</Title>}>
        <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)} items={tabItems} />

        <Row justify="space-between" style={{ marginBottom: 16 }}>
          <Col>
            <Text type="secondary">Mỗi trường quyết định một danh sách ngành, và mỗi ngành có các tổ hợp xét tuyển tương ứng.</Text>
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              Thêm mới
            </Button>
          </Col>
        </Row>

        <Table rowKey="id" loading={loading} columns={activeTab === "universities" ? universityColumns : activeTab === "majors" ? majorColumns : subjectGroupColumns} dataSource={currentData} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={editingItem ? "Chỉnh sửa danh mục" : "Thêm mới danh mục"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={handleModalSubmit}>
          <Form.Item name="code" label="Mã" rules={[{ required: true, message: "Nhập mã" }]}>
            <Input placeholder="Nhập mã danh mục" />
          </Form.Item>
          <Form.Item name="name" label="Tên" rules={[{ required: true, message: "Nhập tên" }]}>
            <Input placeholder="Nhập tên danh mục" />
          </Form.Item>

          {activeTab === "universities" && (
            <Form.Item name="logoUrl" label="Logo URL">
              <Input placeholder="URL logo trường" />
            </Form.Item>
          )}

          {activeTab === "majors" && (
            <>
              <Form.Item name="quota" label="Quota" rules={[{ required: true, message: "Nhập quota" }]}>
                <Input type="number" placeholder="Số lượng tuyển" />
              </Form.Item>
              <Form.Item name="universityId" label="Trường" rules={[{ required: true, message: "Chọn trường" }]}>
                <Select options={universityOptions} placeholder="Chọn trường" />
              </Form.Item>
              <Form.Item name="subjectGroupIds" label="Tổ hợp xét tuyển">
                <Select mode="multiple" allowClear options={subjectGroupOptions} placeholder="Chọn tổ hợp" />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
}
