'use strict'

const express = require('express')
const { authentication, authenticationV2 } = require('../../auth/authUtils')
const { asyncHandler } = require('../../helpers/asyncHandler')
const accessController = require('../../controlles/access.controller')
const router = express.Router()

//signUp

router.post('/shop/signup', asyncHandler(accessController.signUp))

router.post('/shop/login', asyncHandler(accessController.login))

// authenticaltion
router.use(authenticationV2)
//////////
router.post('/shop/logout', asyncHandler(accessController.logout))
router.post('/shop/handlerRefreshToken', asyncHandler(accessController.handlerRefreshToken))

module.exports = router