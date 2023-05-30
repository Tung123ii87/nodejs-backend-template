'use strict'

const {
    BadRequestError,
    NotFoundError
} = require('../core/error.response')

const { convertToObjectIdMongodb } = require('../utils')

const discount = require('../models/discount.model')
const { findAllProducts } = require('../models/repositories/product.repo')

const { findAllDiscountCodesSelect,
    findAllDiscountCodesUnSelect } = require('../models/repositories/discount.repo')

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
            code, start_date, end_date, is_active,
            shopId, min_order_value, product_ids, applies_to,
            name, description, type, max_value, max_uses, uses_count,
            max_users_per_user
        } = payload
        // kiem tra
        if (new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
            throw new BadRequestError('Discount code has expried')
        }

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
            discount_uses_used: uses_used, // ai da su dung
            discount_max_uses_per_user: max_users_per_user, // so luong cho phep toi da su dung
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

    static async getAllDiscountCodesWithProduct({
        code, shopId, userId, limit, page
    }) {
        //create index for discount_code
        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: convertToObjectIdMongodb(shopId)//string => ObjId,
        }).lean()

        if (!foundDiscount || foundDiscount.discount_is_active) {
            throw new NotFoundError('Discount not exists!')
        }

        const { discount_applies_to, discount_product_ids } = foundDiscount
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
        const discounts = await findAllDiscountCodesUnSelect({
            limit: +limit,
            page: +page,
            filter: {
                discount_shopId: convertToObjectIdMongodb(shopId),
                discount_is_active: true,
            },
            unSelect: ['__v', 'discount_shopId'],
            model: discounts
        })

        return discounts
    }
}