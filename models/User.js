const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please provide your username"],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        trim: true,
        lowercase: true
    },
    avatar: {
        type: String,
        default: "https://res.cloudinary.com/devatchannel/image/upload/v1602752402/avatar/avatar_cugq40.png"
    },
    role: {
        type: Number,
        default: 0
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'], 
        }
})

userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        next()
    }

     const salt = await bcrypt.genSalt(10)
     this.password = await bcrypt.hash(this.password, salt)
     next()
})

userSchema.methods.encryptPassword = async function(){
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(this.password, salt)
}

userSchema.methods.passwordMatch = async function(password){
   return await bcrypt.compare(password, this.password)
}

userSchema.methods.genToken = function(){
    const token = jwt.sign({id: this._id}, process.env.JWT_SECRET, {expiresIn: '1h'})
    return token
}

const User = mongoose.model('User', userSchema)

module.exports = User