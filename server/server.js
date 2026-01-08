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
mongoose.connect(MONGO_URI).then(() => console.log("🚀 MongoDB Connected"));

// --- JOB SCHEMA ---
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

// --- ROUTES ---

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
        mentorshipHrs: 45, // Fix: Now explicitly defined
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
      email: incoming.email
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

app.delete('/api/jobs/:jobId', async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.jobId);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/users/alumni', async (req, res) => {
  try {
    const alumni = await User.find({ role: 'alumni' }).select('name role currentCompany graduationYear location linkedin profileImage');
    res.json(alumni);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));