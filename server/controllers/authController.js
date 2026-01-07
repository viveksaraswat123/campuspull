// server/controllers/authController.js
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // Using your schema's comparePassword method
    if (user && (await user.comparePassword(password))) {
      const token = jwt.sign(
        { id: user._id, role: user.role }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1d' }
      );

      res.status(200).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          role: user.role,
          college: user.college,
          profileImage: user.profileImage
        }
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};