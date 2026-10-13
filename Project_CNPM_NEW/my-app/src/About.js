// About.js - Giới thiệu dự án (Phong cách trang trọng)
import React from 'react';

const About = () => {
  const styles = {
    container: {
      padding: '40px',
      maxWidth: '900px',
      margin: '0 auto',
      fontFamily: "'Segoe UI', 'Roboto', Helvetica, Arial, sans-serif",
      lineHeight: '1.6',
      color: '#333',
      backgroundColor: '#fff'
    },
    headerGroup: {
      textAlign: 'center',
      marginBottom: '50px',
      borderBottom: '1px solid #ddd',
      paddingBottom: '20px'
    },
    header: {
      color: '#2c3e50', // Màu xanh đen trang trọng
      fontSize: '32px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      marginBottom: '10px',
      letterSpacing: '1px'
    },
    subtitle: {
      color: '#7f8c8d',
      fontSize: '18px',
      fontStyle: 'italic'
    },
    section: {
      marginBottom: '40px'
    },
    sectionTitle: {
      color: '#2c3e50',
      fontSize: '20px',
      fontWeight: 'bold',
      borderLeft: '5px solid #2c3e50', // Đường kẻ dọc đơn giản thay vì icon
      paddingLeft: '15px',
      marginBottom: '20px',
      textTransform: 'uppercase'
    },
    paragraph: {
      marginBottom: '15px',
      textAlign: 'justify',
      fontSize: '16px'
    },
    // Grid cho phần tính năng
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '30px',
      marginTop: '20px'
    },
    gridItem: {
      border: '1px solid #eee',
      padding: '20px',
      backgroundColor: '#fdfdfd'
    },
    itemTitle: {
      fontSize: '17px',
      fontWeight: 'bold',
      color: '#2c3e50',
      marginBottom: '15px',
      borderBottom: '1px solid #eee',
      paddingBottom: '10px'
    },
    list: {
      paddingLeft: '20px',
      margin: 0
    },
    listItem: {
      marginBottom: '8px',
      fontSize: '15px'
    },
    // Phần thông số kỹ thuật
    specTable: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '15px'
    },
    specRow: {
      borderBottom: '1px solid #eee'
    },
    specLabel: {
      padding: '12px 0',
      fontWeight: 'bold',
      color: '#555',
      width: '30%'
    },
    specValue: {
      padding: '12px 0',
      color: '#333'
    },
    footer: {
      marginTop: '50px',
      paddingTop: '20px',
      borderTop: '1px solid #ddd',
      textAlign: 'center',
      fontSize: '16px',
      fontStyle: 'italic',
      color: '#555'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerGroup}>
        <h1 style={styles.header}>Smart School Bus Tracking System</h1>
        <div style={styles.subtitle}>Phiên bản: SSB 1.0</div>
      </div>

      {/* Tổng quan */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>1. Tổng quan dự án</h2>
        <p style={styles.paragraph}>
          Smart School Bus Tracking System (SSB 1.0) là giải pháp phần mềm quản lý vận tải học đường, 
          được thiết kế nhằm giải quyết các vấn đề về an toàn và minh bạch thông tin trong quá trình 
          đưa đón học sinh. Hệ thống cung cấp khả năng giám sát vị trí thời gian thực và kênh liên lạc 
          thông suốt giữa Nhà trường, Phụ huynh và Đội ngũ vận hành.
        </p>
        <p style={styles.paragraph}>
          Mục tiêu cốt lõi của dự án là giảm thiểu rủi ro, tối ưu hóa quy trình quản lý thủ công và 
          đảm bảo sự an tâm tuyệt đối cho phụ huynh.
        </p>
      </div>

      {/* Chức năng */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>2. Phân hệ chức năng</h2>
        <div style={styles.gridContainer}>
          
          {/* Quản lý */}
          <div style={styles.gridItem}>
            <div style={styles.itemTitle}>Dành cho Quản trị viên</div>
            <ul style={styles.list}>
              <li style={styles.listItem}>Quản lý cơ sở dữ liệu: Học sinh, Tài xế, Phương tiện.</li>
              <li style={styles.listItem}>Thiết lập lộ trình và phân công lịch trình.</li>
              <li style={styles.listItem}>Giám sát toàn bộ đội xe trên bản đồ số.</li>
              <li style={styles.listItem}>Gửi thông báo hệ thống.</li>
            </ul>
          </div>

          {/* Tài xế */}
          <div style={styles.gridItem}>
            <div style={styles.itemTitle}>Dành cho Tài xế</div>
            <ul style={styles.list}>
              <li style={styles.listItem}>Tiếp nhận lịch trình làm việc hàng ngày.</li>
              <li style={styles.listItem}>Xem danh sách điểm đón/trả và học sinh.</li>
              <li style={styles.listItem}>Cập nhật trạng thái hành trình.</li>
            </ul>
          </div>

          {/* Phụ huynh */}
          <div style={styles.gridItem}>
            <div style={styles.itemTitle}>Dành cho Phụ huynh</div>
            <ul style={styles.list}>
              <li style={styles.listItem}>Tra cứu vị trí xe hiện tại.</li>
              <li style={styles.listItem}>Xem thông tin tài xế và biển số xe.</li>
              <li style={styles.listItem}>Nhận thông báo từ nhà trường.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Thông số kỹ thuật */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>3. Thông số kỹ thuật & Hiệu năng</h2>
        <table style={styles.specTable}>
          <tbody>
            <tr style={styles.specRow}>
              <td style={styles.specLabel}>Khả năng đáp ứng</td>
              <td style={styles.specValue}>Hỗ trợ quản lý trên 300 phương tiện đồng thời.</td>
            </tr>
            <tr style={styles.specRow}>
              <td style={styles.specLabel}>Độ trễ dữ liệu</td>
              <td style={styles.specValue}>Tối đa 3 giây cho cập nhật vị trí GPS.</td>
            </tr>
            <tr style={styles.specRow}>
              <td style={styles.specLabel}>Nền tảng hỗ trợ</td>
              <td style={styles.specValue}>Web Application (Responsive Design).</td>
            </tr>
            <tr style={styles.specRow}>
              <td style={styles.specLabel}>Ngôn ngữ</td>
              <td style={styles.specValue}>Tiếng Việt (Mặc định).</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Lợi ích */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>4. Giá trị mang lại</h2>
        <ul style={styles.list}>
          <li style={styles.listItem}>
            <strong>An toàn:</strong> Kiểm soát chặt chẽ quy trình đưa đón, tránh bỏ quên hoặc lạc học sinh.
          </li>
          <li style={styles.listItem}>
            <strong>Minh bạch:</strong> Mọi thông tin về giờ giấc, vị trí đều được ghi nhận và chia sẻ công khai với các bên liên quan.
          </li>
          <li style={styles.listItem}>
            <strong>Hiệu quả:</strong> Thay thế quy trình quản lý giấy tờ thủ công, tiết kiệm thời gian và nhân lực cho nhà trường.
          </li>
        </ul>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        "An toàn của học sinh - Sự an tâm của phụ huynh - Hiệu quả của nhà trường"
      </div>
    </div>
  );
};

export default About;