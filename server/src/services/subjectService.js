import db from '../models/index.js';
const { Subject, TeacherSubject, Teacher, User } = db;

const getAllSubjects = async (page = 1, limit = 15, status = null) => {
  try {
    const offset = (page - 1) * limit;

    // Điều kiện filter theo status (nếu có)
    const whereCondition = status ? { status } : {};

    // Đếm số lượng tổng và theo trạng thái (luôn full, không phân trang)
    const [countAll, countActive, countUpcoming, countEnded, filteredCount] =
      await Promise.all([
        Subject.count(),
        Subject.count({ where: { status: 'active' } }),
        Subject.count({ where: { status: 'upcoming' } }),
        Subject.count({ where: { status: 'ended' } }),
        Subject.count({ where: whereCondition }) // tổng theo filter hiện tại
      ]);

    // Lấy danh sách subject theo filter (có phân trang)
    const subjects = await Subject.findAll({
      where: whereCondition,
      attributes: [
        'id',
        'name',
        'price',
        'grade',
        'status',
        'maxStudents',
        'sessionsPerWeek',
        'image',
        'note',
        [
          db.sequelize.literal(`(
            SELECT COUNT(*)
            FROM studentsubjects AS ss
            WHERE ss.subjectId = Subject.id
          )`),
          'currentStudents'
        ]
      ],
      include: [
        {
          model: TeacherSubject,
          attributes: ['salaryRate'],
          include: [
            {
              model: Teacher,
              attributes: ['id', 'specialty'],
              include: [
                {
                  model: User,
                  as: 'userInfo',
                  attributes: ['id', 'fullName', 'email', 'gender', 'phoneNumber'] 
                }
              ]
            }
          ]
        }
      ],
      offset,
      limit,
      order: [['id', 'ASC']],
    });

    return {
      subjects,
      total: filteredCount, // số lượng đúng theo filter
      countAll,
      countActive,
      countUpcoming,
      countEnded
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateSubject = async (id, updatedData) => {
  const t = await db.sequelize.transaction();

  try {
    const {
      name,
      grade,
      price,
      status,
      maxStudents,
      sessionsPerWeek,
      note,
      teacherId,     // có thể null hoặc ""
      salaryRate     // frontend có thể gửi, nếu không thì default = 0
    } = updatedData;

    // 1. Tìm subject
    const subject = await Subject.findByPk(id, { transaction: t });
    if (!subject) throw new Error('Không tìm thấy môn học');

    // 2. Update subject
    await subject.update({
      name,
      grade,
      price,
      status,
      maxStudents,
      sessionsPerWeek,
      note,
    }, { transaction: t });

    // Chuẩn hoá teacherId
    const teacherIdNorm =
      teacherId === null || teacherId === undefined || teacherId === ""
        ? null
        : parseInt(teacherId, 10);

    // 3. Update TeacherSubject
    const existingTeacherSubject = await TeacherSubject.findOne({
      where: { subjectId: id },
      transaction: t,
    });

    if (existingTeacherSubject) {
      if (teacherIdNorm === null) {
        // Bỏ gán giáo viên → xoá quan hệ
        await existingTeacherSubject.destroy({ transaction: t });
      } else {
        // Cập nhật teacherId + giữ salaryRate cũ nếu không truyền
        const newSalary =
          typeof salaryRate !== "undefined" && salaryRate !== null
            ? salaryRate
            : existingTeacherSubject.salaryRate || 0;

        await existingTeacherSubject.update(
          { teacherId: teacherIdNorm, salaryRate: newSalary },
          { transaction: t }
        );
      }
    } else {
      if (teacherIdNorm !== null) {
        // Chưa có thì tạo mới → luôn truyền salaryRate
        const newSalary =
          typeof salaryRate !== "undefined" && salaryRate !== null
            ? salaryRate
            : 0;

        await TeacherSubject.create(
          { teacherId: teacherIdNorm, subjectId: id, salaryRate: newSalary },
          { transaction: t }
        );
      }
    }

    await t.commit();
    return { success: true, message: "Cập nhật môn học thành công." };
  } catch (error) {
    await t.rollback();
    throw new Error(error.message);
  }
};

const createSubject = async (data) => {
  const t = await db.sequelize.transaction();

  try {
    const {
      name,
      grade,
      price,
      status,
      maxStudents,
      sessionsPerWeek,
      note,
      image,
      teacherId
    } = data;

    // 1️⃣ Tạo subject mới
    const newSubject = await Subject.create(
      {
        name,
        grade,
        price,
        status: status || "active",
        maxStudents: maxStudents || 30,
        sessionsPerWeek: sessionsPerWeek || 1,
        note: note || null,
        image: image || null,
      },
      { transaction: t }
    );

    // 2️⃣ Nếu có teacher → thêm vào TeacherSubject
    const teacherIdNorm =
      teacherId === null || teacherId === undefined || teacherId === ""
        ? null
        : parseInt(teacherId, 10);

    if (teacherIdNorm !== null) {
      await TeacherSubject.create(
        {
          teacherId: teacherIdNorm,
          subjectId: newSubject.id
        },
        { transaction: t }
      );
    }

    await t.commit();

    return {
      success: true,
      message: "Tạo môn học mới thành công.",
      subject: newSubject,
    };
  } catch (error) {
    await t.rollback();
    throw new Error(error.message);
  }
};

const getSubjectById = async (id) => {
  try {
    const subject = await Subject.findByPk(id, {
      attributes: [
        'id',
        'name',
        'price',
        'grade',
        'status',
        'maxStudents',
        'sessionsPerWeek',
        'image',
        'note',
        [
          db.sequelize.literal(`(
            SELECT COUNT(*)
            FROM studentsubjects AS ss
            WHERE ss.subjectId = Subject.id
          )`),
          'currentStudents'
        ]
      ],
      include: [
        {
          model: TeacherSubject,
          attributes: ['salaryRate'],
          include: [
            {
              model: Teacher,
              attributes: ['id', 'specialty'],
              include: [
                {
                  model: User,
                  as: 'userInfo',
                  attributes: ['id', 'fullName', 'email', 'gender', 'phoneNumber']
                }
              ]
            }
          ]
        }
      ]
    });

    if (!subject) throw new Error('Không tìm thấy môn học');

    return subject;
  } catch (error) {
    throw new Error(error.message);
  }
};

const deleteSubject = async (id) => {
  const t = await db.sequelize.transaction();

  try {
    // 1. Tìm subject
    const subject = await Subject.findByPk(id, { transaction: t });
    if (!subject) throw new Error('Không tìm thấy môn học');

    // 2. Xóa các TeacherSubject liên quan
    await TeacherSubject.destroy({
      where: { subjectId: id },
      transaction: t
    });

    // 3. (Tuỳ) Nếu có bảng studentsubjects, xóa luôn quan hệ với học sinh
    await db.StudentSubject.destroy({
      where: { subjectId: id },
      transaction: t
    });

    // 4. Xóa môn học
    await subject.destroy({ transaction: t });

    await t.commit();

    return { success: true, message: 'Xóa môn học thành công.' };
  } catch (error) {
    await t.rollback();
    throw new Error(error.message);
  }
};

export default {
  getAllSubjects,
  updateSubject,
  createSubject,
  getSubjectById,
  deleteSubject, 
};
