const jwt = require("jsonwebtoken")
const User = require("../models/User")
const bcrypt = require('bcryptjs')
const sendMail = require('../utils/sendEmail')


const userCtrl = {
   register: async (req, res)=> {
    try {
      const {email, username, password} = req.body
      if(!email || !username || !password)  return res.status(400).json({msg: "All fields must be filled"})
      if(password.length < 6)  return res.status(400).json({msg: "Password must be atleast 6 characters"})
      const existingUser = await User.findOne({email})
      if(existingUser) return res.status(400).json({msg: "Email already exists"})

      const salt = await bcrypt.genSalt(10)
      const hashPassword = await bcrypt.hash(password, salt)
      const newUser = {email, password: hashPassword, username}
      await new User(newUser).save()

      const activationToken = getActivationToken(newUser)
      const url = `${process.env.CLIENT_URL}/user/activation/${activationToken}`
      console.log(newUser, activationToken, url)

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
  //  sendMail(options)

      res.json({msg: "A message has been sent to your email. Please verify!"})
    } catch (error) {
      return res.status(500).json({msg: error.message})
    }
   },
   activationEmail: async (req, res)=> {
     try {
       const {activationToken} = req.body
       const user = jwt.verify(activationToken, process.env.ACTIVATION_TOKEN)
       const {password, email, username} = user
       const salt = bcrypt.genSaltSync(10)
       const passHash = bcrypt.hashSync(password, salt)
       const newUser = new User({email, username, password: passHash})
       
       await newUser.save()
       console.log({activationToken}, newUser)
       res.json({msg: "Account has been activated. Login!"})
     } catch (error) {
       return res.status(500).json({msg: error.message})
     }
   },
   login: async (req, res)=> {
     try {
       const {email, password} = req.body
       const user = await User.findOne({email})
       if(!user) return res.status(400).json({msg: "Email is not registered. Register!"})
       const isMatch = await bcrypt.compare(password, user.password)
       console.log(isMatch)
       if(!isMatch)  return res.status(400).json({msg: "Password is incorrect"})
      res.json({msg: "Login successful"})
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
  return jwt.sign(payload, process.env.ACTIVATION_TOKEN, {expiresIn: '60m'})
}

module.exports = userCtrl