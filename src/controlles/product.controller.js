'use strict'

const ProductServices = require("../services/product.services")

const { SuccessRespone } = require('../core/success.response')
class ProductController {

    createProduct = async (req, res, next) => {

        new SuccessRespone({
            message: 'Create new Product success',
            metadata: await ProductServices.createProduct(req.body.product_type, req.body)
        }).send(res)
    }

}

module.exports = new ProductController