import React, { useState, useEffect } from "react";
import { createMaterialApi, updateMaterialApi, getAuthMe } from "../../util/api";
import "../../styles/classDetailViews/MaterialModal.css";

export default function MaterialModal({
  onClose,
  onUploadSuccess,
  subjectId,
  editMode = false,
  initialData = null, // nếu có sẽ dùng để update
}) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [file, setFile] = useState(null); // có thể update hoặc giữ nguyên
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getAuthMe();
        if (res?.user?.id) setUserId(res.user.id);
      } catch (err) {
        console.error("Lỗi khi gọi /auth/me:", err);
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề.");
      return;
    }

    if (!userId) {
      setError("Không xác định được người dùng.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      if (file) formData.append("file", file);

      if (editMode) {
        // 👇 gọi API cập nhật
        const res = await updateMaterialApi(initialData.id, formData);
        if (res?.data) {
          onUploadSuccess();
          onClose();
        }
      } else {
        // 👇 gọi API tạo mới
        formData.append("subjectId", subjectId);
        formData.append("userId", userId);
        const res = await createMaterialApi(formData);
        if (res?.data) {
          onUploadSuccess();
          onClose();
        }
      }
    } catch (err) {
      // Xử lý lỗi từ backend (file quá lớn hoặc lỗi khác)
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message); // ví dụ lỗi network, axios
      } else {
        setError("Đã xảy ra lỗi không xác định.");
      }
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>{editMode ? "Cập nhật tài liệu" : "Thêm tài liệu mới"}</h3>

        <form onSubmit={handleSubmit} className="modal-form">
          <label>Tiêu đề:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tiêu đề tài liệu"
            className="modal-input"
          />

          <label>{editMode ? "Chọn file mới (nếu muốn):" : "Chọn file:"}</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
          />

          {error && <p className="error-msg">{error}</p>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Hủy
            </button>
            <button type="submit" className="confirm-btn" disabled={loading}>
              {loading
                ? "Đang xử lý..."
                : editMode
                  ? "Cập nhật"
                  : "Tải lên"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
