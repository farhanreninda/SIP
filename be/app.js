require('dotenv').config()
const express = require('express')
const cors = require('cors')

const router = require('./routes/index')
const { notFound } = require('./exceptions/notFound')
const { handler } = require('./exceptions/handler')

const app = express()

app.set('trust proxy', 'loopback')
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/', router)

app.use(notFound)
app.use(handler)

module.exports = app
