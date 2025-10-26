import db from "../models/index.js";
import { Op } from "sequelize";
import bcrypt from "bcryptjs";
import { saveImage, deleteImage } from "./imageService.js";

import ExcelJS from "exceljs";

const roleMapping = {
  R1: "Giáo viên",
  R2: "Học sinh",
  R0: "Admin",
};
const { Student, User } = db;

const getStudentsByGrade = async (grade) => {
  try {
    const students = await Student.findAll({
      where: { grade },
      include: [
        {
          model: User,
          as: "userInfo",
          attributes: ["id", "fullName", "gender"],
          where: { roleId: 'R2' } // R2 = học sinh
        },
      ],
      attributes: ["id", "dateOfBirth", "schoolName", "grade"],
    });

    return students.map((student) => ({
      id: student.id,
      fullName: student.userInfo?.fullName || "Chưa có tên",
      gender: student.userInfo?.gender,
      dateOfBirth: student.dateOfBirth,
      schoolName: student.schoolName,
      grade: student.grade,
    }));
  } catch (error) {
    throw new Error(error.message);
  }
};


const getAllStudents = async (page = 1, limit = 10, filters = {}) => {
  try {
    const offset = (page - 1) * limit;

    // 🔹 Điều kiện bảng User (role học sinh)
    let userWhere = { roleId: "R2" };

    if (filters.name) {
      userWhere.fullName = { [Op.like]: `%${filters.name}%` };
    }

    if (filters.gender !== undefined && filters.gender !== "") {
      userWhere.gender =
        filters.gender === "true" || filters.gender === "1" ? true : false;
    }

    // 🔹 Điều kiện bảng Student
    let studentWhere = {};
    if (filters.grade) {
      studentWhere.grade = { [Op.like]: `%${filters.grade}%` };
    }
    if (filters.schoolName) {
      studentWhere.schoolName = { [Op.like]: `%${filters.schoolName}%` };
    }

    // 🔹 Điều kiện lọc môn học (qua bảng Subject)
    let subjectInclude = {};
    if (filters.subject) {
      subjectInclude = {
        model: db.StudentSubject,
        include: [
          {
            model: db.Subject,
            where: {
              name: { [Op.like]: `%${filters.subject}%` },
            },
            attributes: ["id", "name", "grade"],
          },
        ],
        attributes: ["id", "studentId", "subjectId", "enrollmentDate"],
      };
    } else {
      subjectInclude = {
        model: db.StudentSubject,
        include: [
          {
            model: db.Subject,
            attributes: ["id", "name", "grade"],
          },
        ],
        attributes: ["id", "studentId", "subjectId", "enrollmentDate"],
      };
    }


    // 🔹 Lấy dữ liệu có phân trang
    const { rows, count } = await db.Student.findAndCountAll({
      where: studentWhere,
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
            "image",
            "roleId",
          ],
        },
        {
          model: db.Address,
          as: "addressInfo",
          attributes: ["id", "details", "ward", "province"],
        },
        {
          model: db.ParentContact,
          as: "ParentContacts",
          attributes: ["id", "fullName", "phoneNumber", "relationship"],
        },
        subjectInclude,
      ],
      limit,
      offset,
      distinct: true,
    });

    // 🔹 Định dạng dữ liệu trả về
    const formattedStudents = rows.map((student) => ({
      id: student.userInfo.id,
      email: student.userInfo.email,
      fullName: student.userInfo.fullName,
      gender: Boolean(student.userInfo.gender),
      phoneNumber: student.userInfo.phoneNumber,
      image: student.userInfo.image,
      roleId: student.userInfo.roleId,
      roleName: roleMapping[student.userInfo.roleId] || "",
      dateOfBirth: student.dateOfBirth,
      grade: student.grade,
      schoolName: student.schoolName,
      address: student.addressInfo
        ? {
            id: student.addressInfo.id,
            details: student.addressInfo.details || "",
            ward: student.addressInfo.ward || "",
            province: student.addressInfo.province || "",
          }
        : { id: null, details: "", ward: "", province: "" },
      subjects: student.StudentSubjects || student.StudentSubjects === undefined
        ? (student.StudentSubjects || []).map((s) => ({
            id: s.Subject?.id || null,
            name: s.Subject?.name || "",
            grade: s.Subject?.grade || "",
            enrollmentDate: s.enrollmentDate,
          }))
        : [],

      parents: student.ParentContacts
        ? student.ParentContacts.map((p) => ({
            id: p.id,
            fullName: p.fullName,
            phoneNumber: p.phoneNumber,
            relationship: p.relationship,
          }))
        : [],
    }));

    return {
      errCode: 0,
      message: "OK",
      data: formattedStudents,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  } catch (e) {
    console.error("❌ Lỗi khi lấy danh sách học sinh:", e);
    return {
      errCode: 500,
      message: "Có lỗi xảy ra từ phía máy chủ!",
    };
  }
};

const createNewStudent = async (data, file) => {
  console.log("📥 Dữ liệu nhận được:", data);

  const { email, password, fullName, phoneNumber, gender, roleId } = data;

  // ✅ Parse JSON string nếu cần
  if (typeof data.address === "string") {
    try {
      data.address = JSON.parse(data.address);
    } catch (err) {
      console.error("❌ Lỗi parse address:", err);
      data.address = null;
    }
  }

  if (typeof data.parents === "string") {
    try {
      data.parents = JSON.parse(data.parents);
    } catch (err) {
      console.error("❌ Lỗi parse parents:", err);
      data.parents = [];
    }
  }

  // ✅ Kiểm tra dữ liệu bắt buộc
  if (!email || !fullName || !roleId) {
    return { errCode: 1, message: "Thiếu các thông tin bắt buộc." };
  }

  // ✅ Kiểm tra email tồn tại
  const existingUser = await db.User.findOne({ where: { email } });
  if (existingUser) {
    return { errCode: 2, message: "Email này đã tồn tại trong hệ thống." };
  }

  if (roleId !== "R2") {
    return { errCode: 3, message: "roleId không hợp lệ, phải là học sinh (R2)." };
  }

  const transaction = await db.sequelize.transaction();

  try {
    // ✅ Hash password (hoặc cho giá trị mặc định nếu không gửi)
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password || "123456", salt);

    // ✅ Lưu ảnh nếu có
    const imagePath = file ? saveImage(file) : null;
    const parsedGender =
      gender === "true" || gender === true || gender === "1" || gender === 1;

    // 1️⃣ Tạo User
    const newUser = await db.User.create(
      {
        email,
        password: hashedPassword,
        fullName,
        phoneNumber,
        gender: parsedGender,
        image: imagePath,
        roleId,
      },
      { transaction }
    );

    // 2️⃣ Tạo Address (nếu có)
    let newAddress = null;
    if (data.address) {
      newAddress = await db.Address.create(
        {
          details: data.address.details || null,
          ward: data.address.ward || null,
          province: data.address.province || null,
        },
        { transaction }
      );
    }

    // 3️⃣ Tạo Student
    const newStudent = await db.Student.create(
      {
        userId: newUser.id,
        dateOfBirth: data.dateOfBirth || null,
        grade: data.grade || null,
        schoolName: data.schoolName || null,
        addressId: newAddress ? newAddress.id : null,
      },
      { transaction }
    );

    // 4️⃣ Tạo ParentContact
    if (Array.isArray(data.parents) && data.parents.length > 0) {
      for (const parent of data.parents) {
        await db.ParentContact.create(
          {
            studentId: newStudent.id,
            fullName: parent.fullName || "",
            phoneNumber: parent.phoneNumber || "",
            relationship: parent.relationship || "Phụ huynh",
          },
          { transaction }
        );
      }
    }

    await transaction.commit();

    console.log("✅ Thêm học sinh mới thành công!");
    return {
      errCode: 0,
      message: "Thêm học sinh mới thành công!",
      newId: newUser.id,
    };
  } catch (e) {
    await transaction.rollback();
    console.error("❌ Lỗi khi thêm học sinh:", e);
    return { errCode: 500, message: "Có lỗi xảy ra từ phía máy chủ!" };
  }
};

const updateStudent = async (studentId, data, file) => {
  try {
    if (!studentId) return { errCode: 1, message: "Thiếu ID học viên!" };

    // 🔹 Tìm student bằng userId (vì Student liên kết với User)
    const student = await db.Student.findOne({ where: { userId: studentId } });
    if (!student) return { errCode: 2, message: "Không tìm thấy học viên!" };

    // 🔹 Tìm user tương ứng
    const user = await db.User.findByPk(studentId);
    if (!user) return { errCode: 3, message: "Không tìm thấy thông tin người dùng!" };

    // 🔹 Parse JSON
    let parsedAddress = {};
    let parsedParents = [];
    try {
      if (data.address) parsedAddress = JSON.parse(data.address);
      if (data.parents) parsedParents = JSON.parse(data.parents);
    } catch (e) {
      console.error("Parse lỗi:", e);
    }

    // 🔹 Xử lý ảnh
    let imagePath = user.image;
    if (file) {
      imagePath = saveImage(file);
      if (user.image) deleteImage(user.image);
    }

    // 🔹 Cập nhật User
    await user.update({
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      gender: data.gender === "true" || data.gender === true,
      image: imagePath,
    });

    // 🔹 Cập nhật Student
    await student.update({
      grade: data.grade,
      schoolName: data.schoolName,
      dateOfBirth: data.dateOfBirth,
    });

    // 🔹 Cập nhật Address
    if (student.addressId) {
      const addr = await db.Address.findByPk(student.addressId);
      if (addr) {
        await addr.update({
          details: parsedAddress.details || "",
          ward: parsedAddress.ward || "",
          province: parsedAddress.province || "",
        });
      }
    }

    // 🔹 Cập nhật ParentContact
    const existingParents = await db.ParentContact.findAll({
      where: { studentId: student.id },
    });

    // Xóa cũ, thêm mới (đơn giản nhất)
    await Promise.all(existingParents.map((p) => p.destroy()));
    if (Array.isArray(parsedParents) && parsedParents.length > 0) {
      for (const p of parsedParents) {
        await db.ParentContact.create({
          studentId: student.id,
          fullName: p.fullName || "",
          phoneNumber: p.phoneNumber || "",
          relationship: p.relationship || "Phụ huynh",
        });
      }
    }

    return { errCode: 0, message: "Cập nhật học viên thành công!" };
  } catch (error) {
    console.error("Lỗi updateStudent:", error);
    return { errCode: 500, message: "Lỗi server khi cập nhật học viên!" };
  }
};

const deleteStudent = async (id) => {
  if (!id) {
    return { errCode: 1, message: "Thiếu ID học viên." };
  }

  const transaction = await db.sequelize.transaction();

  try {
    // 1️⃣ Tìm student qua userId
    const student = await db.Student.findOne({
      where: { userId: id },
      transaction,
    });

    if (!student) {
      await transaction.rollback();
      return { errCode: 2, message: "Không tìm thấy học viên!" };
    }

    // 2️⃣ Xóa tất cả ParentContact liên kết
    await db.ParentContact.destroy({
      where: { studentId: student.id },
      transaction,
    });

    // 3️⃣ Xóa Address nếu có
    if (student.addressId) {
      await db.Address.destroy({
        where: { id: student.addressId },
        transaction,
      });
    }

    // 4️⃣ Xóa Student
    await student.destroy({ transaction });

    // 5️⃣ Xóa User (ảnh đại diện nếu có)
    const user = await db.User.findByPk(id, { transaction });
    if (user) {
      if (user.image) deleteImage(user.image);
      await user.destroy({ transaction });
    }

    await transaction.commit();
    return { errCode: 0, message: "Xóa học viên thành công!" };
  } catch (e) {
    await transaction.rollback();
    console.error("Lỗi khi xóa học viên:", e);
    return { errCode: 500, message: "Có lỗi xảy ra từ phía máy chủ!" };
  }
};


const deleteMultipleStudents = async (studentIds = []) => {
  if (!Array.isArray(studentIds) || studentIds.length === 0) {
    return { errCode: 1, message: "Danh sách ID học viên không hợp lệ!" };
  }

  const transaction = await db.sequelize.transaction();
  try {
    for (const userId of studentIds) {
      // 🔹 Tìm student qua userId (liên kết với bảng users)
      const student = await db.Student.findOne({
        where: { userId },
        transaction,
      });

      if (!student) continue; // Bỏ qua nếu không tồn tại

      // 🔹 Xóa ParentContacts
      await db.ParentContact.destroy({
        where: { studentId: student.id },
        transaction,
      });

      // 🔹 Xóa Address nếu có
      if (student.addressId) {
        await db.Address.destroy({
          where: { id: student.addressId },
          transaction,
        });
      }

      // 🔹 Xóa các môn học đã đăng ký
      await db.StudentSubject.destroy({
        where: { studentId: student.id },
        transaction,
      });

      // 🔹 Xóa bản ghi Student
      await student.destroy({ transaction });

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
      message: `Đã xóa ${studentIds.length} học viên thành công!`,
    };
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Lỗi khi xóa hàng loạt học viên:", error);
    return { errCode: 500, message: "Lỗi server khi xóa học viên hàng loạt!" };
  }
};

const getStudentById = async (studentId) => {
  try {
    if (!studentId) {
      return { errCode: 1, message: "Thiếu ID học viên!" };
    }

    // 🔹 Tìm học viên theo userId
    const student = await db.Student.findOne({
      where: { userId: studentId },
      include: [
        {
          model: db.User,
          as: "userInfo",
          attributes: [
            "id",
            "email",
            "fullName",
            "phoneNumber",
            "gender",
            "image",
            "roleId",
          ],
        },
        {
          model: db.Address,
          as: "addressInfo",
          attributes: ["id", "details", "ward", "province"],
        },
        {
          model: db.ParentContact,
          as: "ParentContacts",
          attributes: ["id", "fullName", "phoneNumber", "relationship"],
        },
        {
          model: db.StudentSubject,
          include: [
            {
              model: db.Subject,
              attributes: ["id", "name", "grade"],
            },
          ],
          attributes: ["id", "studentId", "subjectId", "enrollmentDate"],
        },
      ],
    });

    if (!student) {
      return { errCode: 2, message: "Không tìm thấy học viên!" };
    }

    // 🔹 Định dạng dữ liệu trả về
    const formatted = {
      id: student.userInfo.id,
      email: student.userInfo.email,
      fullName: student.userInfo.fullName,
      phoneNumber: student.userInfo.phoneNumber,
      gender: Boolean(student.userInfo.gender),
      image: student.userInfo.image,
      roleId: student.userInfo.roleId,
      roleName: roleMapping[student.userInfo.roleId] || "",
      dateOfBirth: student.dateOfBirth,
      grade: student.grade,
      schoolName: student.schoolName,
      address: student.addressInfo
        ? {
            id: student.addressInfo.id,
            details: student.addressInfo.details || "",
            ward: student.addressInfo.ward || "",
            province: student.addressInfo.province || "",
          }
        : { id: null, details: "", ward: "", province: "" },
      subjects: student.StudentSubjects
        ? student.StudentSubjects.map((s) => ({
            id: s.Subject?.id || null,
            name: s.Subject?.name || "",
            grade: s.Subject?.grade || "",
            enrollmentDate: s.enrollmentDate,
          }))
        : [],
      parents: student.ParentContacts
        ? student.ParentContacts.map((p) => ({
            id: p.id,
            fullName: p.fullName,
            phoneNumber: p.phoneNumber,
            relationship: p.relationship,
          }))
        : [],
    };

    return {
      errCode: 0,
      message: "OK",
      data: formatted,
    };
  } catch (error) {
    console.error("❌ Lỗi khi lấy chi tiết học viên:", error);
    return { errCode: 500, message: "Lỗi máy chủ khi lấy chi tiết học viên!" };
  }
};


export const exportStudentsToExcel = async (filters) => {
  try {
    const students = await db.Student.findAll({
      include: [
        {
          model: db.User,
          as: "userInfo",
          attributes: [
            "id",
            "email",
            "fullName",
            "phoneNumber",
            "gender",
            "image",
          ],
        },
        {
          model: db.Address,
          as: "addressInfo",
          attributes: ["details", "ward", "province"],
        },
        {
          model: db.ParentContact,
          as: "ParentContacts",
          attributes: ["fullName", "phoneNumber", "relationship"],
        },
      ],
    });

    if (!students.length) return null;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Danh sách học viên");

    worksheet.columns = [
      { header: "STT", key: "index", width: 6 },
      { header: "Họ và tên", key: "fullName", width: 25 },
      { header: "Email", key: "email", width: 25 },
      { header: "Giới tính", key: "gender", width: 10 },
      { header: "SĐT", key: "phoneNumber", width: 15 },
      { header: "Khối", key: "grade", width: 8 },
      { header: "Trường", key: "schoolName", width: 25 },
      { header: "Địa chỉ", key: "address", width: 30 },
      { header: "Phụ huynh", key: "parents", width: 25 },
    ];

    students.forEach((student, idx) => {
      worksheet.addRow({
        index: idx + 1,
        fullName: student.userInfo?.fullName || "",
        email: student.userInfo?.email || "",
        gender: student.userInfo?.gender ? "Nam" : "Nữ",
        phoneNumber: student.userInfo?.phoneNumber || "",
        grade: student.grade || "",
        schoolName: student.schoolName || "",
        address: student.addressInfo
          ? `${student.addressInfo.details || ""}, ${student.addressInfo.ward || ""}, ${student.addressInfo.province || ""}`
          : "",
        parents:
          student.ParentContacts?.map((p) => p.fullName).join(", ") || "",
      });
    });

    // Style cho header
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2E7D32" }, // Xanh lá
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        if (rowNumber > 1) {
          cell.alignment = { vertical: "middle" };
        }
      });
    });

    // ✅ Xuất file ra buffer thay vì file vật lý
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;

  } catch (error) {
    console.error("❌ Lỗi exportStudentsToExcel:", error);
    return null;
  }
};

export default {
  getStudentsByGrade,
  getAllStudents,
  createNewStudent,
  updateStudent,
  deleteStudent,
  deleteMultipleStudents,
  getStudentById,     
  exportStudentsToExcel, 
};
