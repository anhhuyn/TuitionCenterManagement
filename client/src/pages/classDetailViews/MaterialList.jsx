import React, { useEffect, useState, useRef } from "react"; // <-- Import useRef
import {
  getMaterialsBySubjectIdApi,
  deleteMaterialApi,
  getAuthMe,
} from "../../util/api";
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
  const [activeMenu, setActiveMenu] = useState(null);
  const [editMaterial, setEditMaterial] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState(null);

  // <-- Tạo một ref cho mỗi item trong danh sách, hoặc dùng chung một ref cho container
  const menuRefs = useRef([]); // Dùng array ref để lưu trữ ref của mỗi item

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

  // <-- Thêm useEffect để xử lý click ngoài
  useEffect(() => {
    /**
     * Đóng menu nếu click bên ngoài menu hoặc nút mở menu
     * Chúng ta sẽ gắn ref vào phần tử cha bao gồm cả nút và menu
     * và kiểm tra xem target của click có nằm trong ref đó không.
     */
    const handleClickOutside = (event) => {
      // Lặp qua tất cả các ref (của các material-entry)
      let clickedOutside = true;

      // Kiểm tra xem event.target có phải là một phần của bất kỳ item menu nào đang mở không
      // Ở đây chúng ta gắn ref vào `material-entry` hoặc `more-wrapper`
      // Nên ta sẽ kiểm tra xem cú click có nằm trong bất kỳ `more-wrapper` nào không.

      // Cách tốt nhất là gắn ref vào `more-wrapper` (cha của nút và menu)
      const moreWrappers = document.querySelectorAll(".more-wrapper");

      let isInsideAnyMenu = false;
      moreWrappers.forEach((wrapper) => {
        if (wrapper.contains(event.target)) {
          isInsideAnyMenu = true;
        }
      });

      // Nếu click không nằm trong bất kỳ menu nào, ta đóng menu hiện tại
      if (!isInsideAnyMenu && activeMenu !== null) {
        setActiveMenu(null);
      }
    };

    // Lắng nghe sự kiện click trên document
    document.addEventListener("mousedown", handleClickOutside);

    // Dọn dẹp listener khi component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeMenu]); // Chạy lại khi activeMenu thay đổi

  if (loading) return <p className="loading">Đang tải danh sách tài liệu...</p>;

  let filteredMaterials = materials.filter((mat) =>
    mat.title.toLowerCase().includes(search.toLowerCase())
  );

  if (filter === "Mới nhất") {
    filteredMaterials.sort(
      (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)
    );
  } else {
    filteredMaterials.sort(
      (a, b) => new Date(a.uploadedAt) - new Date(b.uploadedAt)
    );
  }

  const handleMenuToggle = (id) => {
    setActiveMenu(activeMenu === id ? null : id);
  };

  const handleUpdate = (material) => {
    setActiveMenu(null); // Đóng menu khi mở modal

    if (!currentUser) {
      alert("Bạn cần đăng nhập để thực hiện thao tác này.");
      return;
    }

    if (currentUser.id !== material.User?.id) {
      alert("Bạn chỉ có thể cập nhật tài liệu do chính mình tải lên.");
      return;
    }

    setEditMaterial(material);
    setShowModal(true);
  };

  // Hàm cũ dùng window.confirm, giữ lại để tham khảo
  // const handleDelete = async (material) => { ... }

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

  const confirmDelete = async () => {
    if (!materialToDelete) return;
    try {
      await deleteMaterialApi(materialToDelete.id);
      fetchMaterials();
    } catch (error) {
      console.error("Lỗi khi xóa tài liệu:", error);
      alert("Xóa tài liệu thất bại, vui lòng thử lại.");
    } finally {
      setShowConfirmModal(false);
      setMaterialToDelete(null);
    }
  };

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
            // Gắn ref vào đây nếu muốn check click ngoài từng item
            // Nhưng cách trên dùng querySelectorAll cho className là đơn giản hơn.
            <div key={mat.id} className="material-entry">
              <div className="material-icon">
                <FiFileText />
              </div>
              <div className="material-desc">
                <div className="material-title-row">
                  <label>{mat.title}</label>
                  <span className="file-type">{mat.type}</span>
                </div>
                <span>
                  Uploaded{" "}
                  {new Date(mat.uploadedAt).toLocaleString("vi-VN")} by{" "}
                  <span className="uploader">
                    {mat.User?.fullName || "Không rõ"}
                  </span>
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
                {/* Đảm bảo element có className="more-wrapper" */}
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