import React from "react";

export default function ParentSuccess({ user, onLogout }) {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Chào phụ huynh <strong>{user.username}</strong></h1>
      <p>Loại tài khoản: <strong>{user.role}</strong></p>
      <button
        onClick={onLogout}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "red",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        Đăng xuất
      </button>
    </div>
  );
}