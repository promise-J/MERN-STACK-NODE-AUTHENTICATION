const jwt = require('jsonwebtoken')
const User = require('../models/User')

const isAuthenticated = async (req, res, next) => {
    const token = req.header('Authorization')

    if(!token) return res.status(400).json({msg: 'Invalid Authorization'})

    try {
        jwt.verify(token, process.env.JWT_SECRET, (err, user)=> {
            if(err) return res.status(400).json({msg: 'Invalid Authorization'})

            req.user = user
            next()
        })
    } catch (error) {
        return res.status(400).json({msg: error.message})
    }
}

module.exports = isAuthenticated
