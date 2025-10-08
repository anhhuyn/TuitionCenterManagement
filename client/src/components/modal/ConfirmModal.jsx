import React from 'react';
import './ConfirmModal.css';
import { FaQuestionCircle } from 'react-icons/fa'; 

const ConfirmModal = ({
  title = "Xác nhận cập nhật",
  message = "Bạn có chắc chắn muốn cập nhật thông tin?",
  cancelText = "Hủy",
  confirmText = "Xác nhận",
  onCancel,
  onConfirm
}) => {
  return (
    <div className="otp-modal-overlay">
      {/*  Icon động phía trên */}
      <div className="modal-icon">
        <FaQuestionCircle />
      </div>

      <div className="confirm-modal playing">
        <div className="wave wave1" />
        <div className="wave wave2" />
        <div className="wave wave3" />
        <div className="infotop">
          <div className="modal-title">{title}</div>
          <div className="modal-message">{message}</div>
          <div className="modal-actions">
            <button className="cancel-btn" onClick={onCancel}>
              {cancelText}
            </button>
            <button className="confirm-btn" onClick={onConfirm}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
