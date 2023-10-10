'use strict'

const express = require('express')
const { authenticationV2 } = require('../../auth/authUtils')
const { asyncHandler } = require('../../helpers/asyncHandler')
const CheckoutController = require('../../controlles/checkout.controller')
const router = express.Router()

router.post('/review', asyncHandler(CheckoutController.checkoutReview))

module.exports = router