require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('SIP Backend API is running. Please access the frontend via index.html or Laragon host.')
})

const authRoutes = require('./routes/auth')
const productRoutes = require('./routes/products')
const txRoutes = require('./routes/transactions')

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/transactions', txRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, ()=> console.log('Server running on port', PORT))
