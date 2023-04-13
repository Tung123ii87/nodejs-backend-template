'use strict'

const ProductServices = require("../services/product.services")
const ProductServicesV2 = require("../services/product.services.xxx")

const { SuccessRespone } = require('../core/success.response')
class ProductController {

    // createProduct = async (req, res, next) => {

    //     new SuccessRespone({
    //         message: 'Create new Product success',
    //         metadata: await ProductServices.createProduct(req.body.product_type, {
    //             ...req.body,
    //             product_shop: req.user.userId
    //         })
    //     }).send(res)
    // }

    createProduct = async (req, res, next) => {

        new SuccessRespone({
            message: 'Create new Product success',
            metadata: await ProductServicesV2.createProduct(req.body.product_type, {
                ...req.body,
                product_shop: req.user.userId
            })
        }).send(res)
    }

    publishProductByShop = async (req, res, next) => {
        new SuccessRespone({
            message: 'Create new Product success',
            metadata: await ProductServicesV2.publishProductByShop({
                product_shop: req.user.userId,
                product_id: req.params.id
            })
        }).send(res)
    }

    unPublishProductByShop = async (req, res, next) => {
        new SuccessRespone({
            message: 'Create new Product success',
            metadata: await ProductServicesV2.unPublishProductByShop({
                product_shop: req.user.userId,
                product_id: req.params.id
            })
        }).send(res)
    }

    /**
     * @desc Get all Drafts for shop
     * @param {Number} limit
     * @param {Number} skip
     * @return { JSON } 
     */
    //Query
    getAllDraftsForShop = async (req, res, next) => {
        new SuccessRespone({
            message: 'Get list Draft success',
            metadata: await ProductServicesV2.findAllDraftsForShop({
                product_shop: req.user.userId
            })
        }).send(res)
    }

    getAllPublishForShop = async (req, res, next) => {
        new SuccessRespone({
            message: 'Get list getAllPublishForShop success',
            metadata: await ProductServicesV2.findAllPublishForShop({
                product_shop: req.user.userId
            })
        }).send(res)
    }

    getListSearchProduct = async (req, res, next) => {
        new SuccessRespone({
            message: 'Get list getListSearchProduct success',
            metadata: await ProductServicesV2.searchProducts(req.params)
        }).send(res)
    }
    //End query
}

module.exports = new ProductController