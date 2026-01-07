import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

// Connect to your local Compass
mongoose.connect("mongodb://localhost:27017/campuspull");

const seedData = async () => {
  try {
    // Clear existing users to avoid duplicates
    await User.deleteMany({});

    // Hash the password "pass123"
    const hashedPassword = await User.hashPassword("pass123");
    
    await User.create([
      {
        name: "Sneha Kapoor",
        email: "alumni@campus.com",
        passwordHash: hashedPassword,
        role: "alumni",
        college: "Example University",
        department: "CSE",
        currentCompany: "Adobe",
        graduationYear: 2023,
        degree: "B.Tech",
        isVerified: true
      },
      {
        name: "Anuj Sharma",
        email: "student@campus.com",
        passwordHash: hashedPassword,
        role: "student",
        college: "Example University",
        department: "CSE",
        year: 3,
        graduationYear: 2025,
        degree: "B.Tech",
        section: "A"
      }
    ]);

    console.log("✅ Database Seeded: Student and Alumni created!");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedData();