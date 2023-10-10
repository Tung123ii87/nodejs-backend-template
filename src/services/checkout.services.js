'use strict'

const { findCartById } = require("../models/repositories/cart.repo")
const { BadRequestError, NotFoundError } = require('../core/error.response')
const { checkProductByServer } = require("../models/repositories/product.repo")


class CheckoutService {
    //login and without login
    /**
     {
        cartId,
        userId,
        shop_order_ids: [],
        item_products: [
            {
                price,
                quantity,
                productId
            }
        ]
     }
     */
    static async checkoutReview({
        cartId,
        userId,
        shop_order_ids = []
    }) {
        //check cartId ton tai hay khong
        const foundCart = await findCartById(cartId)
        if (!foundCart) throw new BadRequestError('Cart does not exists!')

        const checkout_oder = {
            totalPrice: 0, //tong tien hang
            feeShip: 0, // phi van chuyen
            totalDiscount: 0,//tong tien dis giam gia
            totalCheckout: 0 // tong tien thanh toan
        }, shop_order_ids_new = []

        //Tinh tong tien bill
        for (let i = 0; i < shop_order_ids.length; i++) {
            const { shopId, shop_discount = [], item_products = [] } = shop_order_ids[i]
            //check product available
            const checkProductServer = await checkProductByServer(item_products)
            console.log(`checkProductByServer::`, checkProductServer)
            if (!checkProductServer[0]) throw new BadRequestError('order wrong!!')

            //tong tien don hang
            const checkoutPrice = checkProductServer.reduce((acc, produc) => {
                return acc + (product.quantity * product.price)
            }, 0)

            //tong tien truoc khi xu ly
            checkout_oder.totalPrice = + checkoutPrice

            const itemCheckout = {
                shopId,
                shop_discouts,
                priceRaw: checkoutPrice, //time truoc khi giam gia
                priceApplyDiscount: checkoutPrice,
                item_products: checkProductServer
            }

            //neu shop_discount ton tai > 0, check xem co hop le hay ko
            if (shop_discounts.length > 0) {
                //gia su chi co 1 discount 
                //get amount discount
                const { totalPrice = 0, discount = 0 } = await getDiscountAmount({
                    codeId: shop_discounts[0].codeId,
                    useId,
                    shopId,
                    products: checkProductServer
                })
                //tong cong discount giam gia
                checkout_order.totalDiscount += discount

                //neu tien gia gia > 0
                if (discount > 0) {
                    itemCheckout.priceApplyDiscount = checkoutPrice - discount
                }
            }

            //tong thanh toan cuoi cung
            checkout_oder.totalCheckout += itemCheckout.priceApplyDiscount
            shop_order_ids_new.push(itemCheckout)
        }

        return {
            shop_order_ids,
            shop_order_ids_new,
            checkout_oder
        }
    }
}

module.exports = CheckoutService