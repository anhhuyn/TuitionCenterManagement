import db from '../models/index.js';
import bcrypt from 'bcryptjs';
import ExcelJS from "exceljs";
import { saveImage, deleteImage } from "./imageService.js";
import { Op } from "sequelize";
// Định nghĩa roleMapping như cũ
const roleMapping = {
  'R1': 'Giáo viên',
  'R2': 'Học sinh',
  'R0': 'Admin',
};

const getAllTeachers = async (page = 1, limit = 10, filters = {}) => {
  try {
    const offset = (page - 1) * limit;

    // Điều kiện lọc cho User
    let userWhere = { roleId: "R1" };
    if (filters.name) {
      userWhere.fullName = { [Op.like]: `%${filters.name}%` };
    }
    if (filters.gender !== undefined && filters.gender !== "") {
      userWhere.gender = filters.gender === "true" || filters.gender === "1"
        ? true
        : false;
    }


    // Điều kiện lọc cho Teacher
    let teacherWhere = {};
    if (filters.specialty) {
      teacherWhere.specialty = { [Op.like]: `%${filters.specialty}%` };
    }

    const { rows, count } = await db.Teacher.findAndCountAll({
      where: teacherWhere,
      include: [
        {
          model: db.User,
          as: "userInfo",
          where: userWhere,
          attributes: ["id", "email", "fullName", "phoneNumber", "gender", "image", "roleId"],
        },
        {
          model: db.Address,
          as: "addressInfo",
          attributes: ["id", "details", "ward", "province"],
        },
      ],
      limit,
      offset,
      distinct: true, // để count chính xác
    });

    const formattedTeachers = rows.map((teacher) => ({
      id: teacher.userInfo.id,
      email: teacher.userInfo.email,
      fullName: teacher.userInfo.fullName,
      phoneNumber: teacher.userInfo.phoneNumber,
      gender: Boolean(teacher.userInfo.gender),
      image: teacher.userInfo.image,
      roleId: teacher.userInfo.roleId,
      roleName: roleMapping[teacher.userInfo.roleId] || "",
      dateOfBirth: teacher.dateOfBirth,
      specialty: teacher.specialty,
      address: teacher.addressInfo
        ? {
            id: teacher.addressInfo.id,
            details: teacher.addressInfo.details || "",
            ward: teacher.addressInfo.ward || "",
            province: teacher.addressInfo.province || "",
          }
        : { id: null, details: "", ward: "", province: "" },
    }));

    return {
      errCode: 0,
      message: "OK",
      data: formattedTeachers,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  } catch (e) {
    console.error("Lỗi khi lấy danh sách giáo viên:", e);
    return {
      errCode: 500,
      message: "Có lỗi xảy ra từ phía máy chủ!",
    };
  }
};


const createNewEmployee = async (data, file) => {
  const { email, password, fullName, phoneNumber, gender, roleId } = data;

  if (!email || !password || !fullName || !roleId) {
    return { errCode: 1, message: "Thiếu các thông tin bắt buộc." };
  }

  // ✅ Parse lại address nếu frontend gửi theo dạng address[details], address[ward], address[province]
  if (
    !data.address &&
    (data["address[details]"] || data["address[ward]"] || data["address[province]"])
  ) {
    data.address = {
      details: data["address[details]"],
      ward: data["address[ward]"],
      province: data["address[province]"]
    };
  }

  // Kiểm tra email tồn tại
  const existingUser = await db.User.findOne({ where: { email } });
  if (existingUser) {
    return { errCode: 2, message: "Email này đã tồn tại trong hệ thống." };
  }

  if (!roleMapping[roleId]) {
    return { errCode: 3, message: "roleId không hợp lệ." };
  }

  const transaction = await db.sequelize.transaction();
  try {
    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Lưu ảnh nếu có
    const imagePath = file ? saveImage(file) : null;
    const parsedGender =
      gender === 'true' || gender === true || gender === '1' || gender === 1;

    // 1️⃣ Tạo User
    const newUser = await db.User.create({
      email,
      password: hashedPassword,
      fullName,
      phoneNumber,
      gender: parsedGender,
      image: imagePath,
      roleId
    }, { transaction });

    let newAddress = null;

    // 2️⃣ Nếu là giáo viên thì tạo Address + Teacher
    if (roleId === "R1") {
      newAddress = await db.Address.create({
        details: data.address?.details || null,
        ward: data.address?.ward || null,
        province: data.address?.province || null
      }, { transaction });

      await db.Teacher.create({
        userId: newUser.id,
        dateOfBirth: data.dateOfBirth || null,
        specialty: data.specialty || null,
        addressId: newAddress.id
      }, { transaction });
    }

    await transaction.commit();
    return { errCode: 0, message: "Thêm nhân viên mới thành công!", newId: newUser.id };
  } catch (e) {
    await transaction.rollback();
    console.error("Lỗi khi thêm nhân viên:", e);
    return { errCode: 500, message: "Có lỗi xảy ra từ phía máy chủ!" };
  }
};


const updateEmployeeData = async (data, file) => {
  const { id, fullName, phoneNumber, gender, dateOfBirth, specialty, address } = data;

  if (!id) {
    return { errCode: 1, message: "Thiếu ID nhân viên." };
  }

  const transaction = await db.sequelize.transaction();
  try {
    // Tìm teacher và include luôn cả user + address
    const teacher = await db.Teacher.findOne({
      where: { userId: id },
      include: [
        { model: db.User, as: "userInfo" },
        { model: db.Address, as: "addressInfo" }
      ],
      transaction
    });

    if (!teacher) {
      await transaction.rollback();
      return { errCode: 2, message: "Không tìm thấy giáo viên!" };
    }

    // Update user
    let newImagePath = teacher.userInfo.image;
    if (file) {
      deleteImage(teacher.userInfo.image);
      newImagePath = saveImage(file);
    }

    const parsedGender = (gender === 'true' || gender === true || gender === '1' || gender === 1);
    await teacher.userInfo.update(
      {
        fullName,
        phoneNumber,
        gender: parsedGender,
        image: newImagePath
      },
      { transaction }
    );


    // Update teacher info
    await teacher.update(
      { dateOfBirth, specialty },
      { transaction }
    );

    // Update address
    // Update address
  if (address) {
    if (teacher.addressInfo) {
      // Cập nhật địa chỉ nếu đã tồn tại
      await teacher.addressInfo.update(address, { transaction });
    } else {
      // Nếu chưa có thì tạo mới
      const newAddress = await db.Address.create(
        {
          details: address.details || null,
          ward: address.ward || null,
          province: address.province || null
        },
        { transaction }
      );

      await teacher.update(
        { addressId: newAddress.id },
        { transaction }
      );
    }
  }


    await transaction.commit();
    return { errCode: 0, message: "Cập nhật thông tin giáo viên thành công!" };
  } catch (e) {
    await transaction.rollback();
    console.error("Lỗi khi cập nhật giáo viên:", e);
    return { errCode: 500, message: "Có lỗi xảy ra từ phía máy chủ!" };
  }
};


const deleteEmployee = async (id) => {
  if (!id) {
    return { errCode: 1, message: "Thiếu ID nhân viên." };
  }

  try {
    const employee = await db.User.findOne({ where: { id } });
    if (!employee) {
      return { errCode: 2, message: "Không tìm thấy nhân viên!" };
    }
    await employee.destroy();
    return { errCode: 0, message: "Xóa nhân viên thành công!" };
  } catch (e) {
    console.error("Lỗi khi xóa nhân viên:", e);
    return { errCode: 500, message: "Có lỗi xảy ra từ phía máy chủ!" };
  }
};

const exportTeachersToExcel = async (filters = {}) => {
  try {
    // Lấy toàn bộ danh sách (không phân trang)
    let userWhere = { roleId: "R1" };
    if (filters.name) {
      userWhere.fullName = { [Op.like]: `%${filters.name}%` };
    }
    if (filters.gender !== undefined && filters.gender !== "") {
      userWhere.gender =
        filters.gender === "true" || filters.gender === "1" ? true : false;
    }

    let teacherWhere = {};
    if (filters.specialty) {
      teacherWhere.specialty = { [Op.like]: `%${filters.specialty}%` };
    }

    const teachers = await db.Teacher.findAll({
      where: teacherWhere,
      include: [
        {
          model: db.User,
          as: "userInfo",
          where: userWhere,
          attributes: [
            "id",
            "email",
            "fullName",
            "phoneNumber",
            "gender",
            "roleId",
          ],
        },
        {
          model: db.Address,
          as: "addressInfo",
          attributes: ["details", "ward", "province"],
        },
      ],
    });

    // Tạo workbook Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Danh sách giáo viên");

    // Thêm header
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Họ tên", key: "fullName", width: 25 },
      { header: "Email", key: "email", width: 25 },
      { header: "Số điện thoại", key: "phoneNumber", width: 15 },
      { header: "Giới tính", key: "gender", width: 10 },
      { header: "Ngày sinh", key: "dateOfBirth", width: 15 },
      { header: "Chuyên môn", key: "specialty", width: 20 },
      { header: "Địa chỉ", key: "address", width: 30 },
    ];

    // Thêm dữ liệu
    teachers.forEach((t) => {
      worksheet.addRow({
        id: t.userInfo.id,
        fullName: t.userInfo.fullName,
        email: t.userInfo.email,
        phoneNumber: t.userInfo.phoneNumber,
        gender: t.userInfo.gender ? "Nam" : "Nữ",
        dateOfBirth: t.dateOfBirth || "",
        specialty: t.specialty || "",
        address: t.addressInfo
          ? `${t.addressInfo.details || ""}, ${t.addressInfo.ward || ""}, ${
              t.addressInfo.province || ""
            }`
          : "",
      });
    });

    // Xuất ra buffer để trả về response
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (e) {
    console.error("Lỗi khi xuất Excel:", e);
    throw e;
  }
};
const deleteMultipleTeachers = async (teacherIds = []) => {
  if (!Array.isArray(teacherIds) || teacherIds.length === 0) {
    return { errCode: 1, message: "Danh sách ID giáo viên không hợp lệ!" };
  }

  const transaction = await db.sequelize.transaction();
  try {
    for (const userId of teacherIds) {
      // 🔹 Tìm teacher qua userId (liên kết với bảng users)
      const teacher = await db.Teacher.findOne({
        where: { userId },
        transaction,
      });

      if (!teacher) continue; // Nếu không tìm thấy thì bỏ qua

      // 🔹 Xóa Address nếu có
      if (teacher.addressId) {
        await db.Address.destroy({
          where: { id: teacher.addressId },
          transaction,
        });
      }

      // 🔹 Xóa bản ghi Teacher
      await teacher.destroy({ transaction });

      // 🔹 Xóa User (và ảnh nếu có)
      const user = await db.User.findByPk(userId, { transaction });
      if (user) {
        if (user.image) deleteImage(user.image);
        await user.destroy({ transaction });
      }
    }

    await transaction.commit();
    return {
      errCode: 0,
      message: `Đã xóa ${teacherIds.length} giáo viên thành công!`,
    };
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Lỗi khi xóa hàng loạt giáo viên:", error);
    return { errCode: 500, message: "Lỗi server khi xóa giáo viên hàng loạt!" };
  }
};


const getTeacherBasicList = async () => {
  try {
    const teachers = await db.Teacher.findAll({
      attributes: ["id", "userId", "specialty"],
      include: [
        {
          model: db.User,
          as: "userInfo",
          attributes: ["fullName", "email", "phoneNumber", "gender"],
          where: { roleId: "R1" },
        },
      ],
    });

    const formatted = teachers.map((t) => ({
      id: t.id,
      userId: t.userId,
      fullName: t.userInfo.fullName,
      email: t.userInfo.email,
      phoneNumber: t.userInfo.phoneNumber,
      gender: t.userInfo.gender,
      specialty: t.specialty,
    }));

    return { errCode: 0, message: "OK", data: formatted };
  } catch (e) {
    console.error("Lỗi khi lấy danh sách giáo viên (basic):", e);
    return { errCode: 500, message: "Có lỗi xảy ra từ phía máy chủ!" };
  }
};


export default {
  getAllTeachers,
  createNewEmployee,
  updateEmployeeData,
  deleteEmployee,
  exportTeachersToExcel,
  deleteMultipleTeachers,
  getTeacherBasicList,

};