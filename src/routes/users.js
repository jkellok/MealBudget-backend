const express = require('express')
const router = express.Router()
const usersService = require('../services/users')

router.post('/', usersService.create)

router.put('/:id', usersService.updateById)

router.delete('/:id', usersService.deleteById)

module.exports = router