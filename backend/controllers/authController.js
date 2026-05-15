const User = require('../models/User');
const Document = require('../models/Document');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add all required fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const joinDate = new Date().toLocaleDateString('default', { month: 'long', year: 'numeric' });

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      joinDate
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        institution: user.institution,
        subjects: user.subjects,
        joinDate: user.joinDate,
        avatar: user.avatar,
        studyHours: user.studyHours,
        completedTasks: user.completedTasks,
        activeDays: user.activeDays,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        institution: user.institution,
        subjects: user.subjects,
        joinDate: user.joinDate,
        avatar: user.avatar,
        studyHours: user.studyHours,
        completedTasks: user.completedTasks,
        activeDays: user.activeDays,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.institution = req.body.institution || user.institution;
      
      if (req.body.subjects) {
        user.subjects = req.body.subjects;
      }

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        institution: updatedUser.institution,
        subjects: updatedUser.subjects,
        joinDate: updatedUser.joinDate,
        avatar: updatedUser.avatar,
        studyHours: updatedUser.studyHours,
        completedTasks: updatedUser.completedTasks,
        activeDays: updatedUser.activeDays,
        token: req.headers.authorization.split(' ')[1]
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPersonalNotes = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Fetch personal documents OR standard syllabus documents from enrolled communities
    const documents = await Document.find({ 
      $or: [
        { uploadedBy: req.user._id, isPersonal: true },
        { community: { $in: user.subjects }, isPersonal: { $ne: true } }
      ]
    }).populate('community');
    
    // Group them effectively by community subject
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const savePushToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Push token is required' });

    const user = await User.findById(req.user._id);
    if (user) {
      user.expoPushToken = token;
      await user.save();
      res.status(200).json({ message: 'Push token saved successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  getPersonalNotes,
  savePushToken
};
