const router = require('express').Router()
const userCtrl = require("../controllers/auth")

router.post("/register", userCtrl.register)
router.post("/activation", userCtrl.activationEmail)
router.post("/login", userCtrl.login)
router.post("/deleteUser", userCtrl.deleteUser)

module.exports = router