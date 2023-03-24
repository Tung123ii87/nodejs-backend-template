'use strict'

const express = require('express')
const { authenticationV2 } = require('../../auth/authUtils')
const { asyncHandler } = require('../../helpers/asyncHandler')
const productController = require('../../controlles/product.controller')
const router = express.Router()


// authenticaltion
router.use(authenticationV2)
//////////
router.post('', asyncHandler(productController.createProduct))

module.exports = router