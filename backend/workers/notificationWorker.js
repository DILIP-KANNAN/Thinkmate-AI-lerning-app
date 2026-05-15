const { Expo } = require('expo-server-sdk');
const User = require('../models/User');
const Task = require('../models/Task');

// Create a new Expo SDK client
const expo = new Expo();

const sendStudyReminder = async (job) => {
  const { taskId, userId } = job.attrs.data;
  
  try {
    const user = await User.findById(userId);
    const task = await Task.findById(taskId);

    if (!user || !user.expoPushToken) {
      console.log(`No push token for user ${userId}, skipping notification.`);
      return;
    }

    if (!task) {
      console.log(`Task ${taskId} not found.`);
      return;
    }

    if (task.status === 'completed') {
      console.log(`Task ${taskId} is already completed, skipping notification.`);
      return;
    }

    // Check that all your push tokens appear to be valid Expo push tokens
    if (!Expo.isExpoPushToken(user.expoPushToken)) {
      console.error(`Push token ${user.expoPushToken} is not a valid Expo push token`);
      return;
    }

    // Construct the message
    const messages = [{
      to: user.expoPushToken,
      sound: 'default',
      title: 'Study Reminder 📚',
      body: `It's time to study: ${task.task} for ${task.subject}!`,
      data: { taskId: task._id },
    }];

    // The Expo push notification service accepts batches of notifications so
    // that you don't need to send 1000 requests to send 1000 notifications.
    const chunks = expo.chunkPushNotifications(messages);
    
    for (let chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log('Sent push notification:', ticketChunk);
        
        // Mark task as notified
        task.isNotified = true;
        await task.save();
      } catch (error) {
        console.error('Error sending push notification chunk:', error);
      }
    }
  } catch (err) {
    console.error('Error in sendStudyReminder worker:', err);
  }
};

module.exports = {
  sendStudyReminder
};
