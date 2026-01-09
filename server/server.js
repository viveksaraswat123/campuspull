import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import User from './models/User.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const upload = multer({ dest: 'uploads/' });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/campuspull";
mongoose.connect(MONGO_URI).then(() => console.log("MongoDB Connected"));

// JOB SCHEMA 
const jobSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  package: String,
  description: String,
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});
const Job = mongoose.model('Job', jobSchema);

// CONNECTIONS SCHEMA
const connectionSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});
const Connection = mongoose.model('Connection', connectionSchema);

//ROUTES

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      res.json({ success: true, id: user._id, role: user.role, name: user.name, email: user.email });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/user/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    let stats;
    if (user.role === 'alumni') {
      const jobCount = await Job.countDocuments({ postedBy: user._id });
      stats = {
        referrals: 12, 
        mentorshipHrs: 45, 
        profileViews: "1.2k",
        jobPosts: jobCount
      };
    } else {
      stats = { progress: 78, attendance: "94%", tasks: user.projects?.length || 0 };
    }
    res.json({ user, stats });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/user/profile/:id', upload.single('avatar'), async (req, res) => {
  try {
    const incoming = req.body;
    // Map Frontend names to Backend Schema names
    const updates = {
      name: incoming.name,
      role: incoming.role,
      currentCompany: incoming.company, // Maps 'company' to 'currentCompany'
      graduationYear: incoming.batch,   // Maps 'batch' to 'graduationYear'
      location: incoming.location,
      email: incoming.email,
      headline: incoming.headline,
      bio: incoming.bio,
      leetcode: incoming.leetcode,
      github: incoming.github,
      certificationLink: incoming.certificationLink
    };

    if (req.file) {
      updates.profileImage = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user: updatedUser });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/jobs', async (req, res) => {
  try {
    const { title, company, location, salary, description, userId } = req.body;
    const newJob = new Job({ title, company, location, package: salary, description, postedBy: userId });
    await newJob.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/jobs/user/:userId', async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.params.userId }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/jobs/network/:userId', async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [
        { requester: req.params.userId, status: 'accepted' },
        { recipient: req.params.userId, status: 'accepted' }
      ]
    });
    const connectedUserIds = connections.map(conn => 
      conn.requester.toString() === req.params.userId ? conn.recipient : conn.requester
    );
    const jobs = await Job.find({ postedBy: { $in: connectedUserIds } }).sort({ createdAt: -1 }).populate('postedBy', 'name role');
    res.json(jobs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/jobs/:jobId', async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.jobId);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

//CONNECTION ROUTES
app.post('/api/connections', async (req, res) => {
  try {
    const { requesterId, recipientId } = req.body;
    const existing = await Connection.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId }
      ]
    });
    if (existing) return res.status(400).json({ message: 'Connection already exists' });
    const connection = new Connection({ requester: requesterId, recipient: recipientId });
    await connection.save();
    res.json({ success: true, connection });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/connections/requests/:userId', async (req, res) => {
  try {
    const connections = await Connection.find({ recipient: req.params.userId, status: 'pending' }).populate('requester', 'name role profileImage');
    res.json(connections);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/connections/:id/accept', async (req, res) => {
  try {
    const connection = await Connection.findByIdAndUpdate(req.params.id, { status: 'accepted' }, { new: true });
    res.json({ success: true, connection });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/connections/:id/reject', async (req, res) => {
  try {
    const connection = await Connection.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    res.json({ success: true, connection });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/connections/:userId', async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [
        { requester: req.params.userId, status: 'accepted' },
        { recipient: req.params.userId, status: 'accepted' }
      ]
    }).populate('requester recipient', 'name role profileImage');
    res.json(connections);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/users/alumni', async (req, res) => {
  try {
    const alumni = await User.find({ role: 'alumni' }).select('name role currentCompany graduationYear location linkedin profileImage');
    res.json(alumni);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/users/students', async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('name role department year graduationYear location linkedin profileImage');
    res.json(students);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

//USER COLLECTIONS ENDPOINTS
app.post('/api/user/collections/:userId/:type', async (req, res) => {
  try {
    const { userId, type } = req.params;
    const data = req.body;
    const update = { $push: { [type]: data } };
    const user = await User.findByIdAndUpdate(userId, update, { new: true });
    res.json({ success: true, data: user[type] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/user/collections/:userId/:type/:itemId', async (req, res) => {
  try {
    const { userId, type, itemId } = req.params;
    const update = { $pull: { [type]: { _id: itemId } } };
    const user = await User.findByIdAndUpdate(userId, update, { new: true });
    res.json({ success: true, data: user[type] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));