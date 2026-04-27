import * as authService from '../services/authService.js';

const VALID_ROLES = ['principal', 'teacher'];

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body ?? {};

    if (!name || !email || !password || !role) {
      throw new Error('All fields are required');
    }
    if (!email.includes('@') || !email.includes('.')) {
      throw new Error('Invalid email');
    }
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    if (!VALID_ROLES.includes(role)) {
      throw new Error('Invalid role');
    }

    const user = await authService.registerUser(name, email, password, role);

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.error('Error registering user:', error);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      throw new Error('All fields are required');
    }
    if (!email.includes('@') || !email.includes('.')) {
      throw new Error('Invalid email');
    }

    const user = await authService.loginUser(email, password);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.error('Error logging in user:', error);
  }
};
