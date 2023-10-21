'use strict'

const { findCartById } = require("../models/repositories/cart.repo")
const { BadRequestError, NotFoundError } = require('../core/error.response')
const { checkProductByServer } = require("../models/repositories/product.repo")
const { releaseLock } = require("./redis.service")
const { order } = require('../models/order.model')

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
            const { shopId, shop_discounts = [], item_products = [] } = shop_order_ids[i]
            //check product available
            const checkProductServer = await checkProductByServer(item_products)
            console.log(`checkProductByServer::`, checkProductServer)
            if (!checkProductServer[0]) throw new BadRequestError('order wrong!!')

            //tong tien don hang
            const checkoutPrice = checkProductServer.reduce((acc, product) => {
                return acc + (product.quantity * product.price)
            }, 0)

            //tong tien truoc khi xu ly
            checkout_oder.totalPrice = + checkoutPrice

            const itemCheckout = {
                shopId,
                shop_discounts,
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

    //other

    static async orderByUser({
        shop_order_ids_new,
        cartId,
        userId,
        user_adderss = {},
        user_payment = {}
    }) {
        const { shop_order_ids_new, checkout_oder } = await CheckoutService.checkoutReview({
            cartId,
            userId,
            shop_order_ids
        })

        //check lai mot lan nua xem vuot ton kho hay ko
        //get new array products
        const products = shop_order_ids_new.flatMap(order => order.item_products)
        console.log(`[1]:`, products)
        const acquireProduct = []
        for (let i = 0; i < products.length; i++) {
            const { productId, quantity } = products[i];
            const keyLock = await acquireLock(productId, quantity, cartId)
            acquireProduct.push(keyLock ? true : false)
            if (keyLock) {
                await releaseLock(keyLock)
            }
        }

        //check if co mot san pham het hang trong kho
        if (acquireProduct.includes(false)) {
            throw new BadRequestError('Mot so san pham da duoc cap nhat, vui long quay lai gio hang ..')
        }

        const newOrder = await order.create({
            order_userId: userId,
            order_checkout: checkout_order,
            order_shipping: user_address,
            order_payment: user_payment,
            order_products: shop_order_ids_new
        })

        //truong hop neu insert thanh cong, thi remove product co trong cart
        if (newOder) {
            //remove product in my cart

        }

        return newOrder
    }

    /*
        1> Query Orders [Users]
    */
    static async getOrdersByUser() {

    }

    /*
         2> Query Order using Id [Users]
     */
    static async getOneOrderByUser() {

    }
    /*
         3> Cancel Orders [Users]
     */
    static async cancelOrderByUser() {

    }
    /*
         4> Update Orders Status  [Shop | Admin]
     */
    static async updateOrderStatusbyShop() {

    }

}

module.exports = CheckoutService