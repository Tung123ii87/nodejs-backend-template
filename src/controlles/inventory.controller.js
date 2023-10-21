'use strict'

const InventoryService = require("../services/inventory.service")
const { SuccessRespone } = require('../core/success.response')

class InventoryController {

    addStockToInventory = async (req, res, next) => {
        //New 
        new SuccessRespone({
            message: 'Create new cart addStockToInventory',
            metadata: await InventoryService.addStockToInventory(req.body)
        }).send(res)
    }

}

module.exports = new InventoryController()