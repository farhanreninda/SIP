const jwt = require('jsonwebtoken')

function authMiddleware(req,res,next){
  const auth = req.headers.authorization
  if(!auth) return res.status(401).json({error:'no token'})
  const token = auth.replace('Bearer ','')
  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    req.user = decoded
    next()
  }catch(e){ return res.status(401).json({error:'invalid token'}) }
}

function adminOnly(req,res,next){ if(req.user && req.user.role==='admin') return next(); return res.status(403).json({error:'admin only'}) }

module.exports = { authMiddleware, adminOnly }
