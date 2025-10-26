import subjectService from '../services/subjectService.js';

const getSubjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const status = req.query.status || null; // lấy filter status từ query

    const { subjects, total, countAll, countActive, countUpcoming, countEnded } =
      await subjectService.getAllSubjects(page, limit, status);

    return res.status(200).json({
      success: true,
      data: subjects,
      total, // tổng theo filter
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      stats: {
        all: countAll,
        active: countActive,
        upcoming: countUpcoming,
        ended: countEnded,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateSubject = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;

    const result = await subjectService.updateSubject(id, updatedData);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createSubject = async (req, res) => {
  try {
    const data = req.body || {}; 
    const file = req.file;

    if (file) {
      data.image = `/uploads/subjects/${file.filename}`;
    }

    const result = await subjectService.createSubject(data);

    return res.status(201).json({
      success: true,
      message: result.message,
      data: result.subject,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSubjectById = async (req, res) => {
  try {
    const id = req.params.id;

    const subject = await subjectService.getSubjectById(id);

    return res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteSubject = async (req, res) => {
  try {
    const id = req.params.id;

    const result = await subjectService.deleteSubject(id);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  getSubjects,
  updateSubject,
  createSubject,
  getSubjectById,
  deleteSubject,  
};
