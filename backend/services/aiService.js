const generateTasksForSubject = async (subject, numTasks) => {
  // Pre-defined dummy templates.
  const templates = [
    `Introduction to {subject}`,
    `Core Concepts of {subject}`,
    `Advanced Topics in {subject}`,
    `Practical Applications of {subject}`,
    `Review and Self-Assessment: {subject}`,
    `Case Studies in {subject}`,
    `Final Exam Prep: {subject}`
  ];

  const generatedTasks = [];
  
  for (let i = 0; i < numTasks; i++) {
    // If we exceed our template length, start appending "Part X"
    const templateIdx = i % templates.length;
    let title = templates[templateIdx].replace(/{subject}/g, subject);
    
    if (i >= templates.length) {
      title += ` (Part ${Math.floor(i / templates.length) + 1})`;
    }

    // Give some variety in duration and color
    const duration = (i % 2 === 0) ? '1h 30m' : '45m';
    const colorOptions = [
      'bg-blue-50 text-blue-700 border-blue-200',
      'bg-indigo-50 text-indigo-700 border-indigo-200',
      'bg-purple-50 text-purple-700 border-purple-200',
      'bg-green-50 text-green-700 border-green-200'
    ];

    generatedTasks.push({
      task: title,
      time: duration,
      color: colorOptions[i % colorOptions.length]
    });
  }

  return generatedTasks;
};

module.exports = {
  generateTasksForSubject
};
