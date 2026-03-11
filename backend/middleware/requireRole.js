export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user?.role) {
      return res.status(401).json({
        ok: false,
        error: 'Unauthenticated request',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        ok: false,
        error: 'Forbidden: insufficient role',
      });
    }

    next();
  };
}