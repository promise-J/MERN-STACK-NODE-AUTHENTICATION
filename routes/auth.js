const router = require('express').Router()
const userCtrl = require("../controllers/auth")

router.post("/register", userCtrl.Register)
router.post("/activation", userCtrl.ActivateEmail)
router.post("/login", userCtrl.Login)
router.post("/deleteUser", userCtrl.deleteUser)

module.exports = router