function handler(err, req, res, next) {
  console.error(err)

  const status = err.status || err.statusCode || 500
  res.status(status).json({
    error: err.message || 'server error'
  })
}

module.exports = { handler }
