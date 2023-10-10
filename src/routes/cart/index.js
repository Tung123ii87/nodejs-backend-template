'use strict'

const express = require('express')
const { authenticationV2 } = require('../../auth/authUtils')
const { asyncHandler } = require('../../helpers/asyncHandler')
const CartController = require('../../controlles/cart.controller')
const router = express.Router()

router.post('', asyncHandler(CartController.addToCart))
router.delete('', asyncHandler(CartController.delete))
router.post('/update', asyncHandler(CartController.update))
router.get('', asyncHandler(CartController.listToCart))

module.exports = router