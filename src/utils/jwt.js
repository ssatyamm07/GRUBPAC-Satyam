import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  const role =
    user.role != null ? String(user.role).trim().toLowerCase() : user.role;

  return jwt.sign(
    { id: user.id, role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};