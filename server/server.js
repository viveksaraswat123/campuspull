import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();
const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/campuspull";
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.error("❌ DB Connection Error:", err));

// --- AUTH ROUTES ---

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    // Note: Assumes User model has a comparePassword method and passwordHash field
    if (user && (await user.comparePassword(password))) {
      res.json({ 
        success: true, 
        id: user._id, 
        role: user.role, 
        name: user.name,
        email: user.email
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- PROFILE ROUTES ---

// 1. Get Full User Data (including projects, certs, and calculated stats)
app.get('/api/user/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Custom dashboard stats based on role
    const stats = user.role === 'student' 
      ? { progress: 78, attendance: "94%", tasks: user.projects?.length || 0 }
      : { referrals: 15, mentions: 52, reach: "2.4k" };
    
    res.json({ user, stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Update Profile Fields (Headline, Bio, Socials, Coding Handles)
app.patch('/api/user/profile/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body }, 
      { new: true, runValidators: true }
    );
    res.json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- COLLECTIONS ROUTES (Generic Array Management) ---

// 3. Add Item to an Array (Projects, Certifications, etc.)
// Endpoint: /api/user/collections/:id/:type (where type is 'projects' or 'certifications')
app.post('/api/user/collections/:id/:type', async (req, res) => {
  const { id, type } = req.params; 
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user[type].push(req.body); 
    await user.save();
    res.json({ success: true, data: user[type] }); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Remove Item from an Array
app.delete('/api/user/collections/:id/:type/:itemId', async (req, res) => {
  const { id, type, itemId } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user[type] = user[type].filter(item => item._id.toString() !== itemId);
    await user.save();
    res.json({ success: true, data: user[type] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- JOB BOARD ROUTES ---

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

app.post('/api/jobs', async (req, res) => {
  try {
    const { title, company, location, salary, description, userId } = req.body;
    const newJob = new Job({
      title, 
      company, 
      location, 
      package: salary, 
      description, 
      postedBy: userId
    });
    await newJob.save();
    res.json({ success: true, message: "Job posted successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- SERVER INITIALIZATION ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));