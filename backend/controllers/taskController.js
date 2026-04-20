const Task = require('../models/Task');

// Get all tasks for the logged-in user
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving tasks' });
  }
};

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { subject, task, priority, time, color } = req.body;
    
    const newTask = new Task({
      user: req.user._id,
      subject,
      task,
      priority,
      time,
      color
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating task' });
  }
};
