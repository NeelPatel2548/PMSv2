const Interview = require('../models/Interview');
const User = require('../models/User');
const { createAndEmitNotification } = require('./notificationHelper');
const { sendInterviewReminderEmail } = require('./emailService');

// Track which interviews we've already reminded about (prevents duplicates across intervals)
const remindedInterviews = new Set();

/**
 * Check for upcoming interviews in the next 24 hours and send reminder notifications.
 * Designed to run on a setInterval (e.g. every 30 minutes).
 */
const checkUpcomingInterviews = async () => {
  try {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find interviews scheduled within next 24 hours that haven't been cancelled
    const upcoming = await Interview.find({
      scheduledAt: { $gte: now, $lte: in24Hours },
      status: 'scheduled'
    })
      .populate('student', 'user')
      .populate('job', 'title')
      .populate('company', 'name');

    let remindersSent = 0;

    for (const interview of upcoming) {
      // Skip if we've already reminded about this interview
      const reminderKey = String(interview._id);
      if (remindedInterviews.has(reminderKey)) continue;

      // Get the student's user ID
      const studentUserId = interview.student?.user;
      if (!studentUserId) continue;

      const scheduledDate = new Date(interview.scheduledAt);
      const timeStr = scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = scheduledDate.toLocaleDateString();

      await createAndEmitNotification({
        userId: studentUserId,
        title: '📅 Interview Reminder',
        message: `You have "${interview.roundName}" for ${interview.job?.title || 'a position'} at ${interview.company?.name || 'a company'} on ${dateStr} at ${timeStr}. ${
          interview.mode === 'online' && interview.meetingLink
            ? `Meeting link: ${interview.meetingLink}`
            : interview.venue
              ? `Venue: ${interview.venue}`
              : ''
        }`,
        type: 'interview_scheduled',
        link: '/student/interviews'
      });

      // Send email reminder (best effort — don't fail the reminder loop)
      try {
        const studentUser = await User.findById(studentUserId).select('email');
        if (studentUser?.email) {
          await sendInterviewReminderEmail(studentUser.email, {
            roundName: interview.roundName,
            companyName: interview.company?.name || 'a company',
            jobTitle: interview.job?.title || 'a position',
            date: dateStr,
            time: timeStr,
            mode: interview.mode,
            venue: interview.venue,
            meetingLink: interview.meetingLink
          });
        }
      } catch (emailErr) {
        console.warn(`[InterviewReminder] Email send failed for interview ${reminderKey}:`, emailErr.message);
      }

      remindedInterviews.add(reminderKey);
      remindersSent++;
    }

    // Clean up old entries (interviews in the past) to prevent memory leaks
    if (remindedInterviews.size > 1000) {
      remindedInterviews.clear();
    }

    if (remindersSent > 0) {
      console.log(`[InterviewReminder] Sent ${remindersSent} reminder(s)`);
    }
  } catch (err) {
    console.error('[InterviewReminder] Error:', err.message);
  }
};

/**
 * Start the interview reminder check interval.
 * @param {number} intervalMs - Milliseconds between checks (default: 30 minutes)
 */
const startInterviewReminders = (intervalMs = 30 * 60 * 1000) => {
  // Run once immediately after startup (with 10s delay to let DB warm up)
  setTimeout(checkUpcomingInterviews, 10000);

  // Then run on interval
  const interval = setInterval(checkUpcomingInterviews, intervalMs);
  console.log(`[InterviewReminder] Started (checking every ${intervalMs / 60000} minutes)`);

  return interval;
};

module.exports = { checkUpcomingInterviews, startInterviewReminders };
