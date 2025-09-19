import db from '../models/index.js';
import bcrypt from 'bcryptjs';
import { saveImage, deleteImage } from "./imageService.js";
// Định nghĩa roleMapping như cũ
const roleMapping = {
    'R1': 'Giáo viên',
    'R2': 'Học sinh',
    'R0': 'Admin',
};

const getAllTeachers = async () => {
    try {
        const teachers = await db.Teacher.findAll({
            include: [
                {
                    model: db.User,
                    as: 'userInfo',
                    where: { roleId: 'R1' },
                    attributes: ['id', 'email', 'fullName', 'phoneNumber', 'gender', 'image', 'roleId'],
                },
                // Thêm include cho bảng Address
                {
                    model: db.Address,
                    as: 'addressInfo',
                    attributes: ['id','details', 'ward', 'province'], 
                }
            ],
            // Bỏ 'raw: true' và 'nest: true' để có thể truy cập các trường con dễ dàng hơn
        });

        // Ánh xạ lại cấu trúc dữ liệu để lấy các trường bạn yêu cầu
      const formattedTeachers = teachers.map(teacher => {
        return {
          id: teacher.userInfo.id,
          email: teacher.userInfo.email,
          fullName: teacher.userInfo.fullName,
          phoneNumber: teacher.userInfo.phoneNumber,
          gender: Boolean(teacher.userInfo.gender), // chuẩn: luôn trả về true/false
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
                province: teacher.addressInfo.province || ""
              }
            : { id: null, details: "", ward: "", province: "" }

        };
      });

        return {
            errCode: 0,
            message: 'OK',
            data: formattedTeachers
        };
    } catch (e) {
        console.error("Lỗi khi lấy danh sách giáo viên:", e);
        return {
            errCode: 500,
            message: "Có lỗi xảy ra từ phía máy chủ!"
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

export default {
  getAllTeachers,
  createNewEmployee,
  updateEmployeeData,
  deleteEmployee
};