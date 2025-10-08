import cron from 'node-cron';
import db from '../models/index.js';
import { generateSessionsForSchedule } from '../services/subjectScheduleService.js';

/**
 * Cron job chạy mỗi ngày lúc 00:00 để sinh thêm session
 */
cron.schedule('0 0 * * *', async () => {
  console.log('Cron job: Kiểm tra và sinh session mới bắt đầu...');

  try {
    const schedules = await db.SubjectSchedule.findAll();

    for (const schedule of schedules) {
      // Tìm buổi học gần nhất của schedule
      const lastSession = await db.Session.findOne({
        where: { scheduleId: schedule.id },
        order: [['sessionDate', 'DESC']],
      });

      const today = new Date();
      let weeksAhead = 10; // số tuần muốn đảm bảo luôn có
      let lastDate = lastSession ? new Date(lastSession.sessionDate) : today;

      // Nếu buổi học cuối cùng đã cách today < weeksAhead tuần thì sinh thêm
      const diffDays = Math.ceil((lastDate - today) / (1000 * 60 * 60 * 24));
      const weeksMissing = Math.max(0, weeksAhead - Math.ceil(diffDays / 7));

      if (weeksMissing > 0) {
        console.log(`Sinh thêm ${weeksMissing} tuần session cho scheduleId=${schedule.id}`);
        await generateSessionsForSchedule(schedule, weeksMissing);
      }
    }

    console.log('Cron job: Hoàn tất.');
  } catch (error) {
    console.error('Lỗi cron job:', error);
  }
});
