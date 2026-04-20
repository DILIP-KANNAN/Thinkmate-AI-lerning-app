const Community = require('../models/Community');
const Institution = require('../models/Institution');
const Document = require('../models/Document');
const User = require('../models/User');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function syncToRagBackend(userId, subject, topic, filePath, filename) {
  try {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('subject', subject || 'General');
    formData.append('topic', topic || 'General');
    formData.append('file', fs.createReadStream(filePath), filename);

    await axios.post('http://127.0.0.1:8000/upload', formData, {
      headers: { ...formData.getHeaders() }
    });
    console.log(`Successfully synced ${filename} to RAG backend for user ${userId}`);
  } catch (error) {
    console.error('Failed to sync to RAG backend:', error.message);
  }
}


exports.getCommunities = async (req, res) => {
  try {
    const communities = await Community.find().populate('institution');
    res.json(communities);
  } catch (error) {
    res.status(500).json({ message: 'Server error parsing communities' });
  }
};

exports.createCommunity = async (req, res) => {
  try {
    const { subject, name, description, isPrivate } = req.body;
    
    // Create new Community
    const newCommunity = await Community.create({
      subject,
      name,
      description,
      membersCount: 1, // User is first member
      syllabus: [],
      isPrivate: isPrivate === undefined ? true : isPrivate // Default to explicitly private data silos
    });

    // Add user to community
    const user = await User.findById(req.user._id);
    user.subjects.push(newCommunity._id.toString());
    await user.save();

    let newDoc = null;
    // Check if file was uploaded
    if (req.file) {
       const userId = req.user._id.toString();
       // Our storage routes dynamically to /docs/:userId/:filename
       const fileUrl = `${req.protocol}://${req.get('host')}/docs/${userId}/${req.file.filename}`;
       
       newDoc = await Document.create({
         community: newCommunity._id,
         title: req.file.originalname,
         url: fileUrl,
         fileType: 'pdf',
         isPersonal: true,
         uploadedBy: req.user._id,
         topic: 'Custom Upload'
       });
       
       // Forward the physical file to the Python RAG backend
       await syncToRagBackend(
         userId,
         subject,
         'Custom Upload',
         req.file.path,
         req.file.originalname
       );
    }

    res.status(201).json({ community: newCommunity, document: newDoc });
  } catch (error) {
    console.error('Community creation error', error);
    res.status(500).json({ message: 'Error creating community' });
  }
};

exports.getCommunityDocuments = async (req, res) => {
  try {
    // Fetch generic community documents AND this user's personal documents for this community
    const documents = await Document.find({ 
      community: req.params.id,
      $or: [
        { isPersonal: { $ne: true } },
        { isPersonal: true, uploadedBy: req.user._id }
      ]
    });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching documents' });
  }
};

exports.uploadPersonalDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user._id.toString();
    const fileUrl = `${req.protocol}://${req.get('host')}/docs/${userId}/${req.file.filename}`;
    
    const newDoc = await Document.create({
      community: req.params.id,
      title: req.file.originalname,
      url: fileUrl,
      fileType: 'pdf',
      isPersonal: true,
      uploadedBy: req.user._id,
      topic: 'Personal Note'
    });

    // Forward the physical file to the Python RAG backend
    await syncToRagBackend(
      userId,
      'General', // Fallback subject since we only have community ID here
      'Personal Note',
      req.file.path,
      req.file.originalname
    );

    res.status(201).json(newDoc);
  } catch (error) {
    console.error('Document upload error', error);
    res.status(500).json({ message: 'Error uploading document' });
  }
};

exports.getInstitutions = async (req, res) => {
  try {
    const institutions = await Institution.find();
    res.json(institutions);
  } catch (error) {
    res.status(500).json({ message: 'Server error parsing institutions' });
  }
};

// Handle Enrollment
exports.enrollCommunity = async (req, res) => {
  try {
    const { communityId } = req.body;
    const user = await User.findById(req.user._id);
    if (!user.subjects.includes(communityId)) {
      user.subjects.push(communityId);
      await user.save();
    }
    
    // Also increment membersCount
    await Community.findByIdAndUpdate(communityId, { $inc: { membersCount: 1 } });
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error enrolling in community' });
  }
};

// Handle Unenrollment
exports.unenrollCommunity = async (req, res) => {
  try {
    const { communityId } = req.body;
    const user = await User.findById(req.user._id);
    
    if (user.subjects.includes(communityId)) {
       // Filter out safely
       user.subjects = user.subjects.filter(id => id !== communityId);
       await user.save();
       
       // Decrement cleanly bypassing min limit natively if needed but Math max is safer
       await Community.findByIdAndUpdate(communityId, { $inc: { membersCount: -1 } });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error unenrolling from community' });
  }
};
