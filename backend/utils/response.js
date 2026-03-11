export function sendSuccess(res, data = null, status = 200) {
  return res.status(status).json({
    ok: true,
    data,
  });
}

export function sendError(res, message = 'Something went wrong', status = 500, details = null) {
  return res.status(status).json({
    ok: false,
    error: message,
    details,
  });
}