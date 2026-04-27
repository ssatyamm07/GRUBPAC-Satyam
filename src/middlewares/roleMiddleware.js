export const authorize = (...roles) => {
  return (req, res, next) => {
    const userRole =
      req.user?.role != null
        ? String(req.user.role).trim().toLowerCase()
        : '';

    const allowed = roles.map((r) => String(r).trim().toLowerCase());

    if (!allowed.includes(userRole)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `This endpoint requires one of: ${roles.join(', ')}. Your role is: ${userRole || 'unknown'}.`,
      });
    }
    next();
  };
};