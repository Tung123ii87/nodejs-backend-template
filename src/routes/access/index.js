'use strict'

const express = require('express')
const { authentication } = require('../../auth/authUtils')
const { asyncHandler } = require('../../helpers/asyncHandler')
const accessController = require('../../controlles/access.controller')
const router = express.Router()

//signUp

router.post('/shop/signup', asyncHandler(accessController.signUp))

router.post('/shop/login', asyncHandler(accessController.login))

// authenticaltion
router.use(authentication)
//////////
router.post('/shop/logout', asyncHandler(accessController.logout))
router.post('/shop/handlerRefreshToken', asyncHandler(accessController.handlerRefreshToken))

module.exports = router