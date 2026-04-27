import bcrypt from 'bcrypt';
import { User } from '../models/index.js';
import { generateToken } from '../utils/jwt.js';

export const registerUser = async (name, email, password, role) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({
      name,
      email,
      password_hash: hashedPassword,
      role,
    });
    return {
      username: user.name,
      role: user.role,
      msg: 'Registered successfully',
    };
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw new Error('Email already registered');
    }
    throw error;
  }
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error('Invalid email or password');
  }
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    throw new Error('Invalid email or password');
  }
  const token = generateToken(user);
  return {
    name: user.name,
    role: user.role,
    token,
    msg: 'Logged in successfully',
  };
};
