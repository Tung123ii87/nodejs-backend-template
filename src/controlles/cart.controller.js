'use strict'

const CartService = require("../services/cart.services")
const { SuccessRespone } = require('../core/success.response')

class CartController {

    addToCart = async (req, res, next) => {
        //New 
        new SuccessRespone({
            message: 'Create new cart success',
            metadata: await CartService.addToCart(req.body)
        }).send(res)
    }

    update = async (req, res, next) => {
        //New 
        new SuccessRespone({
            message: 'Update cart success',
            metadata: await CartService.addToCartV2(req.body)
        }).send(res)
    }

    delete = async (req, res, next) => {
        //New 
        new SuccessRespone({
            message: 'Delete cart success',
            metadata: await CartService.deleteUserCart(req.body)
        }).send(res)
    }

    listToCart = async (req, res, next) => {
        //New 
        new SuccessRespone({
            message: 'List cart success',
            metadata: await CartService.getListUserCart(req.query)
        }).send(res)
    }
}

module.exports = new CartController()