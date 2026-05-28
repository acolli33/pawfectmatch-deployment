export function requireAuth(req, res, next) {
  const email = req.headers['x-demo-email'];
  const role = req.headers['x-demo-role'];
  const token = req.headers['x-demo-token'];

  if (!email || !role || !token) {
    return res.status(401).json({
      ok: false,
      error: 'Unauthenticated request',
    });
  }

  const expectedToken = `demo-token-${role}`;

  if (token !== expectedToken) {
    return res.status(401).json({
      ok: false,
      error: 'Invalid session token',
    });
  }

  req.user = { email, role };
  next();
}