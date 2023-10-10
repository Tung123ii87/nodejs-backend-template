'use strict'

const CheckoutService = require("../services/checkout.services")
const { SuccessRespone } = require('../core/success.response')

class CheckoutController {

    checkoutReview = async (req, res, next) => {
        //New 
        new SuccessRespone({
            message: 'Create new cart success',
            metadata: await CheckoutService.checkoutReview(req.body)
        }).send(res)
    }

}

module.exports = new CheckoutController()