const dotenv = require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const authRoute = require('./routes/auth')
const logger = require('morgan')
const fileupload = require('express-fileupload')
const cookieParser = require('cookie-parser')
const { isAuthenticated } = require('./middleware/auth')
const User = require('./models/User')


const app = express()

app.use(express.json())
app.use(cors())
app.use(cookieParser())
app.use(fileupload({
  useTempFiles: true
}))


//middleware

//routes here
app.use('/user', authRoute)
// app.use('/api', privateRoute)


const port = process.env.PORT || 5000

const server = app.listen(port, ()=> {
  console.log(`Server running on port: ${port}`)
  mongoose.connect(`mongodb+srv://${process.env.USER_NAME}:${process.env.DB_PASSWORD}@real.jme6j.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`, {
      useCreateIndex: true,
      useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true
  })
  .then(()=> {
      console.log('MongoDB is running...')
      logger('dev')
  })
  .catch(err=> console.log(err))
})

process.on('rejectionHandled', async (error, promise)=> {
  console.log('Logged Error: '+ error)
  server.close(()=> process.exit(1))
})