import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true); 

    fetch('http://localhost:8081/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password: password })
    })
    .then(res => res.json())
    .then(data => {
      setIsLoading(false);
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/home'); 
      } else {
        alert('Lỗi: ' + data.message);
      }
    })
    .catch(err => {
      setIsLoading(false);
      console.error(err);
      alert('Lỗi kết nối đến server!');
      
    });
  };

  const styles = {
    container: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5', fontFamily: "'Segoe UI', sans-serif" },
    loginBox: { width: '100%', maxWidth: '400px', padding: '40px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center' },
    title: { margin: '0 0 10px 0', color: '#333', fontSize: '28px', fontWeight: 'bold' },
    subtitle: { margin: '0 0 30px 0', color: '#666', fontSize: '14px' },
    inputGroup: { marginBottom: '20px', textAlign: 'left' },
    label: { display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500', fontSize: '14px' },
    input: { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' },
    button: { width: '100%', padding: '14px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', transition: 'background 0.2s' },
    footer: { marginTop: '20px', fontSize: '13px', color: '#888' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <h1 style={styles.title}>Đăng Nhập</h1>
        <p style={styles.subtitle}>Smart School Bus System</p>
        <form onSubmit={handleLogin}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email đăng nhập</label>
            <input type="text" placeholder="Ví dụ: ph001@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} required />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Mật khẩu</label>
            <input type="password" placeholder="Nhập mật khẩu..." value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} required />
          </div>
          <button type="submit" style={styles.button} disabled={isLoading}>{isLoading ? 'Đang xử lý...' : 'ĐĂNG NHẬP'}</button>
        </form>
        <div style={styles.footer}>Bạn quên mật khẩu? Liên hệ nhà trường.</div>
      </div>
    </div>
  );
};

export default Login;