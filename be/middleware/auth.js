const jwt = require('jsonwebtoken')

function authentication(req, res, next) {
  const auth = req.headers.authorization
  if (!auth) return res.status(401).json({ error: 'no token' })

  const token = auth.replace('Bearer ', '')

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    return next()
  } catch (error) {
    return res.status(401).json({ error: 'invalid token' })
  }
}

function adminOnly(req, res, next) {
  if (req.user && req.user.role === 'admin') return next()

  return res.status(403).json({ error: 'admin only' })
}

module.exports = authentication
module.exports.authMiddleware = authentication
module.exports.adminOnly = adminOnly
