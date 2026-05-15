const Agenda = require('agenda');
const { sendStudyReminder } = require('../workers/notificationWorker');
const dotenv = require('dotenv');

dotenv.config();

const mongoConnectionString = process.env.MONGO_URI || 'mongodb://localhost:27017/cognitrace';

const agenda = new Agenda({ db: { address: mongoConnectionString, collection: 'agendaJobs' } });

// Define jobs
agenda.define('SEND_STUDY_REMINDER', async (job) => {
  await sendStudyReminder(job);
});

// Start agenda
const startScheduler = async () => {
  await agenda.start();
  console.log('Agenda scheduler started');
};

module.exports = {
  agenda,
  startScheduler
};
