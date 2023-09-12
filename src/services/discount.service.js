'use strict'

const {
    BadRequestError,
    NotFoundError
} = require('../core/error.response')

const { convertToObjectIdMongodb } = require('../utils')

const discount = require('../models/discount.model')
const { findAllProducts } = require('../models/repositories/product.repo')

const { findAllDiscountCodesSelect,
    findAllDiscountCodesUnSelect,
    checkDiscountExists } = require('../models/repositories/discount.repo')

/**
 * Discount Services
 * 1 - Generator Dis Code [Shop/Admin]
 * 2 - Get discout amount [User]
 * 3 - Get all discount codes [Shop/User]
 * 4 - Verify discount code [user]
 * 5 - Delete discount Code [Admin/Shop]
 * 6 - Cancel discount code [user]
 */

class DiscountService {
    static async createDiscountCode(payload) {
        const {
            code, start_date, end_date, is_active, users_used,
            shopId, min_order_value, product_ids, applies_to,
            name, description, type, value, max_value, max_uses, uses_count,
            max_uses_per_user
        } = payload
        // kiem tra
        // if (new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
        //     throw new BadRequestError('Discount code has expried')
        // }

        if (new Date(start_date) >= new Date(end_date)) {
            throw new BadRequestError('Start date must be before end_date')
        }
        //create index for discount code
        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: convertToObjectIdMongodb(shopId)//string => ObjId,
        }).lean()

        if (foundDiscount && foundDiscount.discount_is_active) {
            throw new BadRequestError('Discount exists!')
        }

        const newDiscount = await discount.create({
            discount_name: name,
            discount_description: description,
            discount_type: type, //percentage
            discount_value: value, //10.000, 10
            discount_code: code,
            discount_start_date: new Date(start_date),
            discount_end_date: new Date(end_date),
            discount_max_uses: max_uses,// So luong discount duoc ap dung
            discount_uses_count: uses_count, // So luong discount da su dung 
            discount_users_used: users_used, // ai da su dung
            discount_max_uses_per_user: max_uses_per_user, // so luong cho phep toi da su dung
            discount_min_order_value: min_order_value || 0,
            discount_max_value: max_value,
            discount_shopId: shopId,

            discount_is_active: is_active,
            discount_applies_to: applies_to,
            discount_product_ids: applies_to === 'all' ? [] : product_ids
        })
        return newDiscount

    }

    static async updateDiscountCode() {

    }

    /**
     * Get all discount codes available with products
     * 
     */

    static async getAllDiscountCodesWithProducts({
        code, shopId, userId, limit, page
    }) {
        //create index for discount_code
        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: convertToObjectIdMongodb(shopId)//string => ObjId,
        }).lean()
        if (!foundDiscount || !foundDiscount.discount_is_active) {
            throw new NotFoundError('Discount not exists!')
        }

        const { discount_applies_to, discount_product_ids } = foundDiscount
        let products
        if (discount_applies_to === 'all') {
            //get all product
            products = await findAllProducts({
                filter: {
                    product_shop: convertToObjectIdMongodb(shopId),
                    isPublished: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            })
        }

        if (discount_applies_to === 'specific') {
            //get the product ids
            products = await findAllProducts({
                filter: {
                    _id: { $in: discount_product_ids },
                    isPublished: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            })
        }

        return products
    }

    static async getAllDiscountCodesByShop({
        limit, page, shopId
    }) {
        const discounts = await findAllDiscountCodesSelect({
            limit: +limit,
            page: +page,
            filter: {
                discount_shopId: convertToObjectIdMongodb(shopId),
                discount_is_active: true,
            },
            select: ['discount_name', 'discount_code'],
            model: discount
        })

        return discounts
    }

    /**
     * Apply Discount Code
     * Products =[
     * {
     * productID,
     * shopId,
     * quantity,
     * name,
     * price
     * },
     * {
     * productID,
     * shopId,
     * quantity,
     * name,
     * price
     * },
     * ]
     */

    static async getDiscountAmount({ codeId, userId, shopId, products }) {
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongodb(shopId)
            }
        })

        if (!foundDiscount) throw new NotFoundError(`Discount donesn't exitst`)

        const {
            discount_is_active,
            discount_max_uses,
            discount_min_order_value,
            discount_start_date,
            discount_end_date,
            discount_value,
            discount_type,
            discount_max_uses_per_user,
            discount_users_used
        } = foundDiscount

        if (!discount_is_active) throw new NotFoundError(`discount expried!`)
        if (!discount_max_uses) throw new NotFoundError(`discount are out!`)

        // if (new Date() < new Date(discount_start_date) || new Date() > new Date(discount_end_date))
        //     throw new NotFoundError(`discount ecode has exprised!`)

        // check cem cos et gia tri toi thieu hay ko
        let totalOrder = 0
        if (discount_min_order_value > 0) {
            //get total
            totalOrder = products.reduce((acc, product) => {
                return acc + (product.quantity * product.price)
            }, 0)

            if (totalOrder < discount_min_order_value) {
                throw new NotFoundError(`discount requires a minium order value of ${discount_min_order_value}!`)
            }

            if (discount_max_uses_per_user > 0) {
                const userUserDiscount = discount_users_used.find(user => user.userId === userId)
                if (userUserDiscount) {
                    //
                }
            }
            // check xem discount la fixed_amont -
            const amount = discount_type === 'fixed_amount' ? discount_value : totalOrder * (discount_value / 100)

            return {
                totalOrder,
                discount: amount,
                totalPrice: totalOrder - amount,

            }
        }
    }

    static async deleteDiscountCode({ shopId, codeId }) {
        const deleted = await discount.findOneAndDelete({
            discount_code: codeId,
            discount_shopId: convertToObjectIdMongodb(shopId)
        })
        return deleted
    }
    /*
       Cancel Discunt Code()
    */
    static async cancelDiscountCode({ codeId, shopId, userId }) {
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongodb(shopId)

            }
        })

        if (!foundDiscount) throw new NotFoundError(`discount doesn't exitst`)
        const result = await discount.findByIdAndUpdate(foundDiscount._id, {
            $pull: {
                discount_users_used: userId
            },
            $inc: {
                discount_max_uses: 1,
                discount_uses_count: -1
            }
        })

        return result
    }

}

module.exports = DiscountService