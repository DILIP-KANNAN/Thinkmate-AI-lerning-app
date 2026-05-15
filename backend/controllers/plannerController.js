const Task = require('../models/Task');
const StudyPlan = require('../models/StudyPlan');
const { generateTasksForSubject } = require('../services/aiService');
const { agenda } = require('../services/scheduler');

// @desc    Generate a study plan with scheduled tasks
// @route   POST /api/planner/generate
// @access  Private
const generateStudyPlan = async (req, res) => {
  try {
    const { subject, deadline } = req.body;

    if (!subject || !deadline) {
      return res.status(400).json({ message: 'Subject and deadline are required' });
    }

    const targetDate = new Date(deadline);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ message: 'Invalid deadline format' });
    }

    // Determine the number of tasks based on dummy logic (e.g. 5 tasks)
    const numTasks = 5;
    const generatedTasks = await generateTasksForSubject(subject, numTasks);

    // Create a new study plan
    const studyPlan = await StudyPlan.create({
      user: req.user._id,
      subject,
      deadline: targetDate,
      totalTasks: numTasks
    });

    // Calculate dates spread between today and the deadline
    const now = new Date();
    const timeDiff = targetDate.getTime() - now.getTime();
    
    if (timeDiff <= 0) {
      return res.status(400).json({ message: 'Deadline must be in the future' });
    }

    const intervalMs = timeDiff / numTasks;
    const tasksToInsert = [];

    for (let i = 0; i < generatedTasks.length; i++) {
      const scheduledDate = new Date(now.getTime() + (intervalMs * (i + 1)));
      
      tasksToInsert.push({
        user: req.user._id,
        subject,
        task: generatedTasks[i].task,
        priority: 'Medium',
        time: generatedTasks[i].time,
        date: scheduledDate.toDateString(), // "Mar 24 2026"
        status: 'pending',
        isNotified: false,
        color: generatedTasks[i].color
      });
    }

    // Insert all tasks
    const insertedTasks = await Task.insertMany(tasksToInsert);

    // Schedule notification jobs for each task
    // Schedule it for 10 minutes before the end of the calculated interval
    // For simplicity, we just use the raw date.
    for (let i = 0; i < insertedTasks.length; i++) {
      const task = insertedTasks[i];
      const jobTime = new Date(now.getTime() + (intervalMs * (i + 1)));
      
      // Try to remind 2 hours before the scheduled time, but if that's in the past, just remind them in 5 minutes
      jobTime.setHours(jobTime.getHours() - 2);
      if (jobTime < new Date()) {
        jobTime.setMinutes(jobTime.getMinutes() + 5);
      }

      await agenda.schedule(jobTime, 'SEND_STUDY_REMINDER', {
        taskId: task._id.toString(),
        userId: req.user._id.toString()
      });
    }

    res.status(201).json({
      message: 'Study plan generated successfully',
      studyPlan,
      tasks: insertedTasks
    });

  } catch (error) {
    console.error('Error generating study plan:', error);
    res.status(500).json({ message: 'Server error while generating study plan' });
  }
};

module.exports = {
  generateStudyPlan
};
