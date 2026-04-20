const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Models
const Institution = require('./models/Institution');
const Community = require('./models/Community');
const Document = require('./models/Document');
const User = require('./models/User');
const Task = require('./models/Task');

dotenv.config();
connectDB();

const institutionsData = [
  {
    name: "Indian Institute of Technology Madras",
    description: "A premier engineering and research institution in Chennai.",
    about: "IIT Madras is one of the top technological institutes in India, known for its cutting-edge research and innovation in computer science and engineering.",
    website: "https://www.iitm.ac.in",
  },
  {
    name: "National Institute of Technology Trichy",
    description: "One of the best NITs in the country renowned for academic excellence.",
    about: "NIT Trichy offers diverse tech programs and is a leader in cultivating strong engineering foundations for students globally.",
    website: "https://www.nitt.edu",
  },
  {
    name: "Sri Sivasubramaniya Nadar College of Engineering",
    description: "A highly-ranked private engineering college in Chennai.",
    about: "SSN College of Engineering provides a rich campus life and strong academics, particularly noted for excellence in computer science education.",
    website: "https://www.ssn.edu.in",
  },
  {
    name: "Chennai Institue of Technology",
    description: "A leading private institute in Chennai specializing in computing.",
    about: "CIT Chennai offers comprehensive programs focusing on hands-on software development, modern computing networks, and AI fundamentals.",
    website: "https://www.citchennai.edu.in",
  },
  {
    name: "Rajalakshmi Engineering College",
    description: "An autonomous engineering institution committed to quality education.",
    about: "REC is known for nurturing engineers with robust problem-solving skills, supported by modern labs and a strong computing faculty.",
    website: "https://www.rajalakshmi.org",
  }
];

const csSubjects = [
  {
    subject: "Data Structures and Algorithms",
    description: "Learn the core concepts of memory layout, data organization, and algorithmic efficiency, including Big-O notation, trees, graphs, and dynamic programming.",
    syllabus: [
      "Introduction to Algorithms & Complexity",
      "Arrays, Strings & Linked Lists",
      "Stacks & Queues",
      "Trees & Binary Search Trees",
      "Graph Algorithms",
      "Dynamic Programming"
    ]
  },
  {
    subject: "Operating Systems",
    description: "Understand the fundamentals of OS design, process management, concurrency, memory allocation, and file systems.",
    syllabus: [
      "OS Architecture & Processes",
      "CPU Scheduling",
      "Process Synchronization & Deadlocks",
      "Memory Management & Paging",
      "Virtual Memory",
      "File Systems & I/O"
    ]
  },
  {
    subject: "Database Management Systems",
    description: "Explore the theoretical and practical concepts of database design, SQL querying, transaction management, and indexing.",
    syllabus: [
      "Introduction to Databases & ER Models",
      "Relational Algebra & SQL",
      "Normalization (1NF, 2NF, 3NF, BCNF)",
      "Transaction Processing",
      "Concurrency Control",
      "Indexing & Hashing"
    ]
  },
  {
    subject: "Computer Networks",
    description: "A deep dive into network architectures, protocols across the OSI stack, routing, switching, and network security.",
    syllabus: [
      "Network Protocol Stack & OSI Model",
      "Application Layer Protocols (HTTP, DNS)",
      "Transport Layer (TCP/UDP)",
      "Network Layer & Routing Protocols",
      "Data Link Layer & MAC",
      "Network Security Basics"
    ]
  },
  {
    subject: "Software Engineering",
    description: "Gain skills in software engineering lifecycles, Agile development, architecture design, and software testing.",
    syllabus: [
      "Software Process Models (Agile, Waterfall)",
      "Requirements Engineering",
      "Software Architecture & Design",
      "UML & System Modeling",
      "Software Testing & QA",
      "Maintenance & Project Management"
    ]
  }
];

// Helper for random PDFs
const samplePdfs = [
  'http://localhost:5000/docs/sample1.pdf',
  'http://localhost:5000/docs/sample2.pdf',
  'http://localhost:5000/docs/sample3.pdf'
];

async function seedData() {
  try {
    console.log('Clearing existing data...');
    // We don't wipe Users to preserve logins, but we wipe Communities, Institutions, Tasks, Documents
    await Institution.deleteMany();
    await Community.deleteMany();
    await Document.deleteMany();
    
    // Clear user subjects to prevent dangling references
    await User.updateMany({}, { $set: { subjects: [] } });

    console.log('Inserting standard institutions...');
    const createdInstitutions = await Institution.insertMany(institutionsData);

    console.log('Generating subjects mapped as communities...');
    for (let inst of createdInstitutions) {
      for (let subjectDef of csSubjects) {
        
        // Create the community
        const community = new Community({
          name: `${inst.name} - ${subjectDef.subject}`,
          subject: subjectDef.subject,
          institution: inst._id,
          description: subjectDef.description,
          syllabus: subjectDef.syllabus,
          membersCount: Math.floor(Math.random() * 500) + 50,
          isPrivate: false,
          isVerified: true,
          trending: Math.random() > 0.5
        });

        const savedCommunity = await community.save();

        // Create mock PDF documents for each syllabus topic
        for (let i = 0; i < subjectDef.syllabus.length; i++) {
          const topic = subjectDef.syllabus[i];
          const doc = new Document({
            title: `Notes: ${topic}`,
            community: savedCommunity._id,
            url: samplePdfs[i % samplePdfs.length],
            topic: topic,
            fileType: 'pdf'
          });
          await doc.save();
        }
      }
    }

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error during seeding: ${error.message}`);
    process.exit(1);
  }
}

seedData();
