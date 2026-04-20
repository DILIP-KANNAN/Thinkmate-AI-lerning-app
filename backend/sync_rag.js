const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Document = require('./models/Document');
const connectDB = require('./config/db');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

dotenv.config();

async function syncAllToRag() {
  await connectDB();
  const docs = await Document.find();
  
  console.log(`Found ${docs.length} documents. Preparing to sync to RAG Fastapi Backend...`);

  for (const doc of docs) {
    if (!doc.url) continue;
    
    // Extract filename from URL (e.g. http://localhost:5000/docs/sample1.pdf -> sample1.pdf)
    const urlObj = new URL(doc.url);
    const pathname = decodeURIComponent(urlObj.pathname); 
    const localPath = path.join(__dirname, 'public', pathname.replace('/docs/', 'docs/'));
    
    if (fs.existsSync(localPath)) {
      try {
        const formData = new FormData();
        // Fallback user ID to global/public if we can't determine it
        formData.append('user_id', doc.uploadedBy ? doc.uploadedBy.toString() : 'public');
        formData.append('subject', 'General');
        formData.append('topic', doc.topic || 'General');
        // PASS doc.title as the filename so metadata document_name exactly matches titles!
        formData.append('file', fs.createReadStream(localPath), doc.title);

        console.log(`Uploading ${doc.title}...`);
        const res = await axios.post('http://127.0.0.1:8000/upload', formData, {
          headers: { ...formData.getHeaders() }
        });
        console.log(`[Success] ${doc.title}: ${res.data.status}`);
      } catch (err) {
        console.log(`[Failed] ${doc.title}: ${err.message}`);
      }
    } else {
      console.log(`[Skipped] ${doc.title}: File not found at ${localPath}`);
    }
  }
  
  process.exit();
}

syncAllToRag();
