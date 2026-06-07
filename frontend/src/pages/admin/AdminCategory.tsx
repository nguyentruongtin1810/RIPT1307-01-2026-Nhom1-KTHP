import { Button, Card, Col, Form, Input, Modal, Row, Select, Space, Table, Typography, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useState } from "react";

const { Title } = Typography;

export default function AdminCategory() {
  const [data, setData] = useState<any[]>([
    { id: 1, name: "Công nghệ thông tin", type: "Ngành", code: "CNTT", status: "Hoạt động" },
    { id: 2, name: "Đại học Bách Khoa", type: "Trường", code: "BKA", status: "Hoạt động" },
    { id: 3, name: "A00", type: "Tổ hợp", code: "A00", status: "Hoạt động" }
  ]);
  const [filterType, setFilterType] = useState<string | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const filteredData = data.filter((item) => (filterType ? item.type === filterType : true));

  const columns = [
    { title: "Mã", dataIndex: "code", key: "code" },
    { title: "Tên danh mục", dataIndex: "name", key: "name" },
    { title: "Loại", dataIndex: "type", key: "type" },
    { title: "Trạng thái", dataIndex: "status", key: "status", render: () => <span style={{color: "green"}}>Hoạt động</span> },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EditOutlined />} type="link">Sửa</Button>
          <Button icon={<DeleteOutlined />} type="link" danger>Xóa</Button>
        </Space>
      )
    }
  ];

  const handleAdd = (values: any) => {
    const newItem = {
      id: Date.now(),
      name: values.name,
      type: values.type,
      code: values.code,
      status: "Hoạt động"
    };
    setData([...data, newItem]);
    message.success("Thêm danh mục thành công!");
    setIsModalOpen(false);
    form.resetFields();
  };

  return (
    <div className="page-shell">
      <Card className="page-card" title={<Title level={4}>Quản lý Danh mục</Title>}>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Select
              placeholder="Lọc theo loại danh mục"
              allowClear
              value={filterType}
              onChange={(val) => setFilterType(val)}
              style={{ width: "100%" }}
              options={[
                { value: "Trường", label: "Trường Đại học" },
                { value: "Ngành", label: "Ngành học" },
                { value: "Tổ hợp", label: "Tổ hợp xét tuyển" }
              ]}
            />
          </Col>
          <Col span={16} style={{ textAlign: "right" }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
              Thêm Mới Danh Mục
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Thêm Mới Danh Mục"
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); form.resetFields(); }}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={handleAdd}>
          <Form.Item name="type" label="Loại danh mục" rules={[{ required: true, message: "Chọn loại danh mục" }]}>
            <Select
              options={[
                { value: "Trường", label: "Trường Đại học" },
                { value: "Ngành", label: "Ngành học" },
                { value: "Tổ hợp", label: "Tổ hợp xét tuyển" }
              ]}
              placeholder="Chọn loại"
            />
          </Form.Item>
          <Form.Item name="code" label="Mã danh mục" rules={[{ required: true, message: "Nhập mã danh mục" }]}>
            <Input placeholder="Ví dụ: CNTT, A00..." />
          </Form.Item>
          <Form.Item name="name" label="Tên danh mục" rules={[{ required: true, message: "Nhập tên danh mục" }]}>
            <Input placeholder="Nhập tên chi tiết..." />
          </Form.Item>
          <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">Lưu lại</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}