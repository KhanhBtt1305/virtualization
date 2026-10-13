import React from "react";
import "./App.css"; // CSS riêng

function Modal({ show, onClose, title, value }) {
  if (!show) return null; /* ẩn */

  return (
    <div className="modal-overlay">
      <div className="modal">
        {/* Header */}
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Content */}
        <div className="modal-content">
          <p><b>Chi tiết:</b> {value}</p>
        </div>
      </div>
    </div>
  );
}

export default Modal;

