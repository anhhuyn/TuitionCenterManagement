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
                  attributes: ['id', 'fullName', 'email']
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

export default {
  getAllSubjects
};
