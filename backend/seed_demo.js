const mongoose = require('mongoose');
const Task = require('./models/Task');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const users = await User.find({});
  if (users.length === 0) {
    console.log('No users found to seed demo');
    process.exit();
  }
  console.log('Seeding demo tasks for', users.length, 'users...');

  // Clear existing planner tasks to avoid duplicates
  await Task.deleteMany({ subject: 'Demo: Computer Science' });

  const numTasks = 5;
  const now = new Date();
  
  const tasksToInsert = [];
  const colors = [
    'bg-blue-100 text-blue-700 border-blue-300',
    'bg-purple-100 text-purple-700 border-purple-300',
    'bg-green-100 text-green-700 border-green-300',
    'bg-indigo-100 text-indigo-700 border-indigo-300',
    'bg-orange-100 text-orange-700 border-orange-300'
  ];

  for (const user of users) {
    for (let i = 0; i < numTasks; i++) {
      const d = new Date();
      d.setDate(now.getDate() + i); // Spread tasks over the next 5 days
      tasksToInsert.push({
        user: user._id,
        subject: 'Demo: Computer Science',
        task: `Chapter ${i + 1} Review`,
        priority: 'High',
        time: '2h',
        date: d.toDateString(),
        status: 'pending',
        isNotified: false,
        color: colors[i % colors.length]
      });
    }
  }

  await Task.insertMany(tasksToInsert);
  console.log('Demo tasks inserted successfully!');
  mongoose.disconnect();
}).catch(console.error);
