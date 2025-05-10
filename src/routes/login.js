const express = require('express')
const router = express.Router()
const loginService = require('../services/login')

//router.get('/', loginService.getAll)

router.post('/', loginService.login)

module.exports = router