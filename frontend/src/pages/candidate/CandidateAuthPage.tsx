import { Button, Card, Form, Input, message, Typography, Row, Col } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../../api/authApi";
import { setToken, setUser } from "../../utils/auth";

const { Title, Text } = Typography;

export default function CandidateAuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      if (isRegister) {
        // --- LUỒNG XỬ LÝ ĐĂNG KÝ ---
        const response = await register({
          username: values.username,
          fullName: values.fullName,
          email: values.email,
          password: values.password
        });

        // In log ra Console để kiểm tra cấu trúc dữ liệu thực tế nhận được
        console.log("Phản hồi thực tế từ API Đăng ký:", response);

        // Ép kiểu 'as any' để đọc linh hoạt, tránh lỗi TypeScript chặn khi check thuộc tính động
        const resData = response as any;

        // Chỉ cần hàm register chạy thành công (không nhảy vào catch) nghĩa là DB đã tạo bản ghi thành công
        if (resData || resData?.success || resData?.message) {
          const targetToken = resData?.token;
          const targetUser = resData?.user;

          // Kịch bản 1: Backend tự động đăng nhập luôn (có trả về token)
          if (targetToken) {
            setToken(targetToken);
            setUser(targetUser);
            message.success("Đăng ký thành công. Bạn đã được tự động đăng nhập.");
            navigate("/student/dashboard");
          } 
          // Kịch bản 2: Backend đăng ký thành công và không trả về token (Phổ biến nhất)
          else {
            message.success("Đăng ký tài khoản thành công! Vui lòng đăng nhập lại.");
            setIsRegister(false); // Tự động bật giao diện form Đăng nhập
            form.setFieldsValue({ email: values.email, password: "" }); // Giữ lại email vừa gõ cho tiện
          }
        } else {
          message.error("Đăng ký thất bại. Máy chủ phản hồi dữ liệu trống hoặc không hợp lệ.");
        }

      } else {
        // --- LUỒNG XỬ LÝ ĐĂNG NHẬP ---
        const response = await login({
          identifier: values.email, 
          password: values.password
        } as any);

        console.log("Phản hồi thực tế từ API Đăng nhập:", response);

        const resData = response as any;

        if (resData) {
          const targetToken = resData.token;
          const targetUser = resData.user;

          if (targetToken) {
            setToken(targetToken);
            setUser(targetUser);
            message.success("Đăng nhập thành công.");

            if (targetUser?.role === "admin") {
              navigate("/admin/dashboard");
            } else {
              navigate("/student/dashboard");
            }
          } else {
            message.error("Thông tin đăng nhập không chính xác hoặc phản hồi thiếu mã token xác thực.");
          }
        } else {
          message.error("Đăng nhập thất bại. Không nhận được phản hồi từ hệ thống.");
        }
      }
    } catch (error: any) {
      // Bẫy lỗi chuẩn từ backend (Ví dụ: "Username or email already exists.")
      // Dừng xử lý ngay, hoàn toàn KHÔNG lưu bất kỳ token/email rác nào vào bộ nhớ trình duyệt khi có lỗi
      message.error(error.message || "Thao tác thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', backgroundColor: '#f0f2f5', overflow: 'hidden' }}>
      <Row style={{ width: '100%', height: '100%' }}>
        
        {/* NỬA TRÁI: Split-screen hiển thị hình ảnh trường học */}
        <Col xs={0} md={12} style={{
          position: 'relative',
          background: 'linear-gradient(135deg, #001529 0%, #003a8c 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px',
          color: '#ffffff'
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.2,
            zIndex: 1
          }} />
          
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '440px', textAlign: 'center' }}>
            <Title level={1} style={{ color: '#fff', margin: '0 0 16px 0', fontSize: '28px', fontWeight: 'bold' }}>
              CỔNG TUYỂN SINH TRỰC TUYẾN
            </Title>
            <Text style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '15px', lineHeight: '1.6' }}>
              Hệ thống nộp hồ sơ xét tuyển học bạ trực tuyến, giúp quản lý thông tin nguyện vọng và tra cứu kết quả một cách minh bạch, hiệu quả.
            </Text>
          </div>
        </Col>

        {/* NỬA PHẢI: Form đăng nhập/đăng ký dạng Card phẳng */}
        <Col xs={24} md={12} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <Card 
            bordered={false} 
            style={{ 
              width: '100%', 
              maxWidth: '400px', 
              boxShadow: 'none', 
              borderRadius: '8px',
              border: '1px solid #f0f0f0' 
            }}
          >
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <Title level={3} style={{ margin: 0 }}>
                {isRegister ? "Đăng ký thí sinh" : "Đăng nhập thí sinh"}
              </Title>
              <Text type="secondary" style={{ fontSize: '13px' }}>
                Hệ thống xác thực và phân quyền tự động
              </Text>
            </div>

            <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
              
              {isRegister && (
                <>
                  <Form.Item
                    label="Tài khoản (Username)"
                    name="username"
                    rules={[{ required: true, message: "Vui lòng nhập tên tài khoản đăng nhập" }]}
                  >
                    <Input placeholder="nguyenvana123" size="large" />
                  </Form.Item>

                  <Form.Item
                    label="Họ và tên"
                    name="fullName"
                    rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
                  >
                    <Input placeholder="Nguyễn Văn A" size="large" />
                  </Form.Item>
                </>
              )}

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" }, 
                  { type: "email", message: "Email không hợp lệ" }
                ]}
              >
                <Input placeholder="email@example.com" size="large" />
              </Form.Item>

              <Form.Item
                label="Mật khẩu"
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
              >
                <Input.Password placeholder="********" size="large" />
              </Form.Item>

              <Form.Item style={{ marginTop: '24px' }}>
                <Button type="primary" htmlType="submit" block loading={loading} size="large" style={{ fontWeight: 500 }}>
                  {isRegister ? "Đăng ký tài khoản" : "Đăng nhập"}
                </Button>
              </Form.Item>
            </Form>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Text type="secondary">
                {isRegister ? "Đã có tài khoản? " : "Chưa có tài khoản? "}
                <span 
                  onClick={() => {
                    setIsRegister(!isRegister);
                    form.resetFields();
                  }} 
                  style={{ color: '#1890ff', cursor: "pointer", marginLeft: 4, fontWeight: 500 }}
                >
                  {isRegister ? "Đăng nhập ngay" : "Đăng ký ngay"}
                </span>
              </Text>
            </div>
          </Card>
        </Col>

      </Row>
    </div>
  );
}