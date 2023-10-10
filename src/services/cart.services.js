'use strict'

const { cart } = require('../models/cart.model')
const { BadRequestError, NotFoundError } = require('../core/error.response')
const { getProductById } = require('../models/repositories/product.repo')

/*
Key features: Cart Service
- add product to cart (user)
- reduce product quantity by One (User)
- increase product quantity by Use (User)
- Get cart (User)
- Delete cart [User]
- Delete cart item [User]
*/

class CartService {

    /// Start repo cart///
    static async createUserCart({ userId, product }) {

        const query = { cart_userId: userId, cart_state: 'active' },
            updateOrInsert = {
                $addToSet: {
                    cart_products: product,

                },
            }, options = { upsert: true, new: true }

        return await cart.findOneAndUpdate(query, updateOrInsert, options)
    }

    static async updateUserCartQuantity({ userId, product }) {
        const { productId, quantity } = product;
        const query = {
            cart_userId: userId,
            'cart_products.productId': productId,
            cart_state: 'active'
        }, updateSet = {
            $inc: {
                'cart_products.$.quantity': quantity
            }
        }, options = { upsert: true, new: true }

        return await cart.findOneAndUpdate(query, updateSet, options)
    }
    /// End repo cart///

    static async addToCart({ userId, product = {} }) {
        //check cart ton tai ko
        const userCart = await cart.findOne({ cart_userId: userId })
        if (!userCart) {
            //create cart for user
            return await CartService.createUserCart({ userId, product })
        }

        //Neu co gio hang roi nhung chua co sp thi sao
        if (!userCart.cart_products.length) {

            userCart.cart_products = [product]
            return await userCart.save()
        }

        //Gio hang ton tai va co sp nay thi update quantity
        return await CartService.updateUserCartQuantity({ userId, product })
    }

    //update cart
    /**
     shop_order_ids: [
        {
            shopId,
            item_products: [
                {
                    quantity,
                    price,
                    shopId,
                    old_quantity,
                    productId
                }
            ],
            version
        }
     ]
     */
    static async addToCartV2({ userId, shop_order_ids }) {
        const { productId, quantity, old_quantity } = shop_order_ids[0]?.item_products[0]
        //CHeck product
        const foundProduct = await getProductById(productId)
        if (!foundProduct) throw new NotFoundError('')
        //compare
        if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId) {
            throw new NotFoundError('Product do not belong to the shop')
        }

        if (quantity === 0) {
            // deleted 
        }

        return await CartService.updateUserCartQuantity({
            userId,
            product: {
                productId,
                quantity: quantity - old_quantity
            }
        })
    }

    static async deleteUserCart({ userId, productId }) {
        const query = { cart_userId: userId, cart_state: 'active' },
            updateSet = {
                $pull: {
                    cart_products: {
                        productId
                    }
                }
            }
        const deleteCart = await cart.updateOne(query, updateSet)
        return deleteCart
    }

    static async getListUserCart({ userId }) {
        return await cart.findOne({
            cart_userId: +userId
        }).lean()
    }
}

module.exports = CartService