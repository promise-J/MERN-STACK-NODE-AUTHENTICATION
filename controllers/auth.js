// const SendmailTransport = require('nodemailer/lib/sendmail-transport')
const User = require('../models/User')
const sendMail = require('../utils/sendEmail')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { options } = require('../routes/auth')

const userCtrl = {
  Register: async (req, res)=> {
    try {
      const {email, username, password} = req.body
      if(!email || !password || !username)
          return res.status(400).json({msg: "Please enter all fields"})
      if(!validateEmail(email))
          return res.status(400).json({msg: "Invalid Email"})
      const user = await User.findOne({email})
      if(user)
        return res.status(400).json({msg: "This email already exist"})
      if(password < 6)
        return res.status(400).json({msg: 'Password must be atleast 6 characters'})
      const passwordHash = await bcrypt.hash(password, 12)
      const newUser = {
        email,
        password: passwordHash,
        username
      }

      const activationToken = getActivationToken(newUser)
      const url = `${process.env.CLIENT_URL}/user/activate/${activationToken}`
      const message = `
         <div style="height: 400px; width: 800px; box-shadow: 4px 2px 12px 4px gray; border: 1px solid gray;">
         <h2 style="text-align: center; font-size: 30px;">WELCOME TO ADVANCE REACT AUTHENTICATION</h2>
         <p style="text-align: center; font-size: 24px;">Please activate your account by clicking on the link below...</p><br />
         <a href=${url} style="color: white; margin: 2rem; text-decoration: none; background-color: red; padding: 0.5rem 1rem; borderRadius: 7px; outline: none;">Activate your account</a> <span style="font-size: 20px">or copy this link below</span> <br />
         <div style="margin: 3rem;">${url}</div>
         </div>
      `
      const options = {
        to: email,
        subject: 'Email Activation',
        message
      }
      sendMail(options)
      console.log(url)
      res.json({msg: "Register Success! Please activate your email to start."})
    } catch (error) {
      return res.status(500).json({msg: error.message})
    }
    
  },
  ActivateEmail: async (req, res)=> {
    try {
      const {activation_token} = req.body
      const user = jwt.verify(activation_token, process.env.ACTIVATION_TOKEN)
      const {email, username, password} = user
      const existingUser = await User.findOne({email})
      console.log(user)
      if(existingUser)
        return res.status(400).json({msg: `${email} is already registered. Login!`})
      const newUser = new User({
        email, username, password
      })
      await newUser.save()
      res.json({msg: "Account has been activated. Login!"})
    } catch (error) {
      return res.status(500).json({msg: error.message})
    }
  },
  Login: async (req, res)=> {
     try {
       const {email, password} = req.body
       const user = await User.findOne({email})
       if(!user)  return res.status(400).json({msg: `${email} does not exists`})
      
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch)  return res.status(400).json({msg: 'Password is not correct!'})
        
        const refresh_token = getRefreshToken({id: user.id})
        console.log({refresh_token}, user)

       res.json({msg: "Login success"})
     } catch (error) {
       return res.status(500).json({msg: error.message})
     }
  },
  deleteUser: async (req, res)=> {
    try {
      const {email} = req.body
      const user = await User.findOneAndDelete({email})
      if(!user) return res.status(400).json({msg: 'No user with this email'})
      res.status(200).json({msg: `${email} deleted...`})
    } catch (error) {
      return res.status(500).json({msg: error.message})
    }
  }
}

const getRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_SECRET, {expiresIn: '7d'})
}
const getAccessToken = (payload)=> {
  return jwt.sign(payload, process.env.ACCESS_TOKEN, {expiresIn: '15m'})
}
const getActivationToken = (payload)=> {
  return jwt.sign(payload, process.env.ACTIVATION_TOKEN, {expiresIn: '5m'})
}

function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

module.exports = userCtrl