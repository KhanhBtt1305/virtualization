// Signin.js
import React, { useState } from "react";
import "./App.css";

export default function Signin({ tenTK, setTenTK, matkhau, setMatkhau, onLogin }) {
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!tenTK || !matkhau) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
// gửi POST request lên server
    try {
      const res = await fetch("http://localhost:5000/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tai_khoan: tenTK, matkhau })

      });
// nhận lại response
      const data = await res.json();
      if (res.ok) {
        onLogin(data.user); // chuyển sang Success
      } else {
        setError(data.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      console.error(err);
      setError("Không thể kết nối server");
    }
  };

  return (
    <div className="login-container">
      <nav className="navbar">
        <h1 className="logo">G5BUS</h1>
        <ul>
          <li>Home</li>
          <li>Buses</li>
          <li>About</li>
          <li>Contact Us</li>
        </ul>
      </nav>

      <div className="login-box">
        <div className="login-image">
          {/* PUBLIC/IMG */}
          <img src="/img/Rectangle 1.png" alt="bus stop" />
        </div>
        <div className="login-form">
          <h2>Login</h2>
          <input
            type="text"
            placeholder="Tên tài khoản"
            value={tenTK}
            onChange={(e) => setTenTK(e.target.value)}
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={matkhau}
            onChange={(e) => setMatkhau(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
          {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
        </div>
      </div>
    </div>
  );
}