import materialService from '../services/materialService.js';

const getMaterialsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    if (!subjectId) return res.status(400).json({ message: 'Vui lòng cung cấp subjectId' });

    const materials = await materialService.getMaterialsBySubjectId(subjectId);
    if (!materials || materials.length === 0)
      return res.status(404).json({ message: 'Không tìm thấy tài liệu cho môn học này' });

    return res.status(200).json({ message: 'Lấy danh sách tài liệu thành công', data: materials });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

const uploadMaterial = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Vui lòng chọn file." });
    const material = await materialService.createMaterial(req.body, req.file);
    return res.status(200).json({ message: "Tải lên thành công", data: material });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateMaterialFile = async (req, res) => {
  try {
    const { materialId } = req.params;
    const newTitle = req.body.title; // lấy title nếu có
    const file = req.file;

    if (!file && !newTitle) {
      return res.status(400).json({ message: "Không có dữ liệu nào để cập nhật (file hoặc title)." });
    }

    const updatedMaterial = await materialService.updateMaterialFile(materialId, file, newTitle);

    return res.status(200).json({
      message: "Cập nhật tài liệu thành công.",
      data: updatedMaterial
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


const deleteMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;
    if (!materialId) return res.status(400).json({ message: "Vui lòng cung cấp materialId" });

    await materialService.deleteMaterial(materialId);

    return res.status(200).json({ message: "Xóa tài liệu thành công." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


export default {
  getMaterialsBySubject,
  uploadMaterial,
  updateMaterialFile,
  deleteMaterial
};

