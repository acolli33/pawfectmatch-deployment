export function requireAuth(req, res, next) {
  const email = req.headers['x-demo-email'];
  const role = req.headers['x-demo-role'];

  if (!email || !role) {
    return res.status(401).json({
      ok: false,
      error: 'Unauthenticated request',
    });
  }

  req.user = { email, role };
  next();
}