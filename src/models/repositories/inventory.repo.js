const { inventory } = require('../inventory.model')
const { Types } = require('mongoose')

const insertInventory = async ({
    productId, shopId, stock, location = 'unKnow'
}) => {
    return await inventory.create({
        inven_productId: productId,
        inven_location: location,
        inven_shopId: shopId,
        inven_stock: stock
    })
}

module.exports = {
    insertInventory
}