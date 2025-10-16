import React, { useEffect, useState } from "react";
import { getMaterialsBySubjectIdApi, deleteMaterialApi, getAuthMe } from "../../util/api";
import "../../styles/classDetailViews/MaterialList.css";
import { FiMoreVertical, FiDownload, FiFileText, FiFilter } from "react-icons/fi";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import MaterialModal from "./MaterialModal";
import ConfirmModal from "../../components/modal/ConfirmModal";

export default function MaterialList({ classData }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Mới nhất");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null); // <--- state quản lý menu hiện tại
  const [editMaterial, setEditMaterial] = useState(null); // lưu dữ liệu cần cập nhật
  const [currentUser, setCurrentUser] = useState(null);
   // State quản lý modal xác nhận xóa
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState(null);
  
  // Lấy user hiện tại
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await getAuthMe();
        if (res?.user) setCurrentUser(res.user);
      } catch (error) {
        console.error("Lỗi lấy thông tin user:", error);
      }
    };
    fetchCurrentUser();
  }, []);


  const fetchMaterials = async () => {
    try {
      const res = await getMaterialsBySubjectIdApi(classData.id);
      if (res && res.data) setMaterials(res.data);
    } catch (error) {
      console.error("Lỗi khi lấy tài liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classData?.id) fetchMaterials();
  }, [classData]);

  if (loading) return <p className="loading">Đang tải danh sách tài liệu...</p>;

  let filteredMaterials = materials.filter((mat) =>
    mat.title.toLowerCase().includes(search.toLowerCase())
  );

  if (filter === "Mới nhất") {
    filteredMaterials.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  } else {
    filteredMaterials.sort((a, b) => new Date(a.uploadedAt) - new Date(b.uploadedAt));
  }

  const handleMenuToggle = (id) => {
    setActiveMenu(activeMenu === id ? null : id); // click lần nữa sẽ tắt menu
  };

  const handleUpdate = (material) => {
    setEditMaterial(material);
    setShowModal(true);
  };

  const handleDelete = async (material) => {
    setActiveMenu(null);

    if (!currentUser) {
      alert("Bạn cần đăng nhập để thực hiện thao tác này.");
      return;
    }

    if (currentUser.id !== material.User?.id) {
      alert("Bạn chỉ có thể xóa tài liệu do chính mình tải lên.");
      return;
    }

    // Confirm trước khi xóa
    if (!window.confirm(`Bạn có chắc muốn xóa tài liệu "${material.title}" không?`)) {
      return;
    }

    try {
      // Gọi API xóa (đã viết trong service)
      await deleteMaterialApi(material.id);
      fetchMaterials(); // tải lại danh sách
    } catch (error) {
      console.error("Lỗi khi xóa tài liệu:", error);
      alert("Xóa tài liệu thất bại, vui lòng thử lại.");
    }
  };

   const handleDeleteClick = (material) => {
    setActiveMenu(null);

    if (!currentUser) {
      alert("Bạn cần đăng nhập để thực hiện thao tác này.");
      return;
    }

    if (currentUser.id !== material.User?.id) {
      alert("Bạn chỉ có thể xóa tài liệu do chính mình tải lên.");
      return;
    }

    setMaterialToDelete(material);
    setShowConfirmModal(true);
  };

  // Khi xác nhận xóa trong modal
  const confirmDelete = async () => {
    if (!materialToDelete) return;
    try {
      await deleteMaterialApi(materialToDelete.id);
      alert("Xóa tài liệu thành công!");
      fetchMaterials();
    } catch (error) {
      console.error("Lỗi khi xóa tài liệu:", error);
      alert("Xóa tài liệu thất bại, vui lòng thử lại.");
    } finally {
      setShowConfirmModal(false);
      setMaterialToDelete(null);
    }
  };

  // Khi hủy xóa
  const cancelDelete = () => {
    setShowConfirmModal(false);
    setMaterialToDelete(null);
  };

  return (
    <div className="material-wrapper">
      <div className="material-header">
        <div className="filter-tabs">
          <FiFilter className="filter-icon" />
          <button
            className={`tab ${filter === "Mới nhất" ? "active" : ""}`}
            onClick={() => setFilter("Mới nhất")}
          >
            Mới nhất
          </button>
          <button
            className={`tab ${filter === "Cũ nhất" ? "active" : ""}`}
            onClick={() => setFilter("Cũ nhất")}
          >
            Cũ nhất
          </button>
        </div>

        <div className="search-add">
          <input
            type="text"
            placeholder="Tìm kiếm tài liệu..."
            className="search-box"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="add-btn" onClick={() => setShowModal(true)}>
            + Thêm tài liệu
          </button>
        </div>
      </div>

      {filteredMaterials.length === 0 ? (
        <p className="no-material">Không tìm thấy tài liệu nào.</p>
      ) : (
        <div className="material-list">
          {filteredMaterials.map((mat) => (
            <div key={mat.id} className="material-entry">
              <div className="material-icon"><FiFileText /></div>
              <div className="material-desc">
                <div className="material-title-row">
                  <label>{mat.title}</label>
                  <span className="file-type">{mat.type}</span>
                </div>
                <span>
                  Uploaded {new Date(mat.uploadedAt).toLocaleString("vi-VN")} by{" "}
                  <span className="uploader">{mat.User?.fullName || "Không rõ"}</span>
                </span>
              </div>
              <div className="material-actions">
                <span className="file-size">Dung lượng: {mat.fileSize}</span>
                <a
                  href={`${import.meta.env.VITE_BACKEND_URL}${mat.fileURL}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="icon-btn download"
                  title="Tải xuống"
                >
                  <FiDownload />
                </a>
                <div className="more-wrapper">
                  <button
                    className="icon-btn more"
                    title="Tùy chọn"
                    onClick={() => handleMenuToggle(mat.id)}
                  >
                    <FiMoreVertical />
                  </button>
                  {activeMenu === mat.id && (
                    <div className="more-menu">
                      <button onClick={() => handleUpdate(mat)}>
                        <FiEdit className="menu-icon" />
                        Cập nhật
                      </button>
                      <button onClick={() => handleDeleteClick(mat)}>
                        <FiTrash2 className="menu-icon" />
                        Xóa
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <MaterialModal
          onClose={() => {
            setShowModal(false);
            setEditMaterial(null);
          }}
          onUploadSuccess={fetchMaterials}
          subjectId={classData.id}
          editMode={!!editMaterial}
          initialData={editMaterial}
        />
      )}
      {showConfirmModal && (
        <ConfirmModal
          title="Xác nhận xóa tài liệu"
          message={`Bạn có chắc muốn xóa tài liệu "${materialToDelete?.title}" không?`}
          cancelText="Hủy"
          confirmText="Xóa"
          onCancel={cancelDelete}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
