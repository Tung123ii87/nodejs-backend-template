'use strict'

const express = require('express')
const { authenticationV2 } = require('../../auth/authUtils')
const { asyncHandler } = require('../../helpers/asyncHandler')
const InventoryController = require('../../controlles/inventory.controller')
const router = express.Router()

router.use(authenticationV2)
router.post('', asyncHandler(InventoryController.addStockToInventory))

module.exports = router