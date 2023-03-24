'use strict'
const { model, Schema, Types } = require('mongoose')

const DOCUMENT_NAME = 'Product'
const COLLECTION_NAME = 'Products'

const productSchema = new Schema({
    product_name: { type: String, require: true },
    product_thumb: { type: String, require: true },
    product_description: String,
    product_price: { type: Number, require: true },
    product_quantity: { type: Number, require: true },
    product_type: { type: String, require: true, enum: ['Electronics', 'Clothing', 'Furnitune'] },
    product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
    product_attributes: { type: Schema.Types.Mixed, require: true },
}, {
    collation: COLLECTION_NAME,
    timestamps: true
})


const clothingScheme = new Schema({
    brand: { type: String, require: true },
    size: String,
    material: String
}, {
    collation: 'clothes',
    timestamps: true
})


const electronicScheme = new Schema({
    manufacturer: { type: String, require: true },
    model: String,
    color: String
}, {
    collation: 'electronics',
    timestamps: true
})

module.exports = {
    product: model(DOCUMENT_NAME, productSchema),
    electronic: model('Electronics', electronicScheme),
    clothing: model('Clothing', clothingScheme),
}