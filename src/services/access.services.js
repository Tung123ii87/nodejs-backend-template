'use strict'

const shopModel = require('../models/shop.model')
const bcrypt = require('bcrypt')
const crypto = require('node:crypto')
const KeyTokenService = require('./keyToken.service')
const { createTokenPair, verifyJWT } = require('../auth/authUtils')
const { getInfoData } = require('../utils')
const { BadRequestError, ConflictRequestError, AuthFailureError, ForbiddenError } = require('../core/error.response')
const { findByEmail } = require('./shop.service')

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessServices {

    /*
    check this token used?
    */
    static handlerRefreshToken = async (refreshToken) => {
        //Check xem token da dc su dung chua
        const foundToken = await KeyTokenService.FindByRefreshTokenUsed(refreshToken)
        //Neu co
        if (foundToken) {
            //decode xem la ai co trong he thong ko
            const { userId, email } = await verifyJWT(refreshToken, foundToken.privateKey)
            console.log({ userId, email })

            //Xoa tat ca token trong keyStore
            await KeyTokenService.deleteKeyById(userId)
            throw new ForbiddenError('Something wrong happend !! pls relogin')
        }

        //Neu ko co
        const hodlerToken = await KeyTokenService.FindByRefreshToken(refreshToken)
        if (!hodlerToken) throw new AuthFailureError('Shop not register')

        //VerifyToken
        const { userId, email } = await verifyJWT(refreshToken, hodlerToken.privateKey)
        console.log('[2]---', { userId, email })

        //check userId
        const foundShop = await findByEmail({ email })
        if (!foundShop) throw new AuthFailureError('Shop not register')
        //create 1 cap moi
        const tokens = await createTokenPair({ userId, email }, hodlerToken.publicKey, hodlerToken.privateKey)
        //update token
        await hodlerToken.update({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken //da dc suy dung de lay token moi
            }
        })

        return {
            user: { userId, email },
            tokens
        }
    }


    static logout = async (keyStore) => {
        const delKey = await KeyTokenService.removeKeyById(keyStore._id)
        console.log({ delKey })
        return delKey
    }

    /**
        * 1-Check email in dbs
        * 2-Match password
        * 3-Create AT and RT and save
        * 4-Generate token
        * 5-Get data return login
    */
    static login = async ({ email, password, refreshToken = null }) => {
        //1.
        const foundShop = await findByEmail({ email })
        if (!foundShop) throw new BadRequestError('Shop not registerd')

        //2.
        const match = bcrypt.compare(password, foundShop.password)
        if (!match) throw new AuthFailureError('Authentication error')

        //3.
        //created privateKey, publicKey
        const privateKey = crypto.randomBytes(64).toString('hex')
        const publicKey = crypto.randomBytes(64).toString('hex')

        //4-Generate token
        const { _id: userId } = foundShop
        const tokens = await createTokenPair({ userId, email }, publicKey, privateKey)

        await KeyTokenService.createKeyToken({
            refreshToken: tokens.refreshToken,
            privateKey, publicKey, userId
        })
        return {
            shop: getInfoData({ fileds: ['_id', 'name', 'email'], object: foundShop }),
            tokens
        }
    }

    static signUp = async ({ name, email, password }) => {
        // try {
        //step1: check email exists
        const hodlerShop = await shopModel.findOne({ email }).lean()
        if (hodlerShop) {
            throw new BadRequestError('Error: Shop already registered')
        }

        const passwordHash = await bcrypt.hash(password, 10)
        const newShop = await shopModel.create({
            name, email, password: passwordHash, roles: [RoleShop.SHOP]
        })

        console.log("newShop", newShop)

        if (newShop) {
            //create privateKey, publicKey
            // const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
            //     modulusLength: 4096,
            //     publicKeyEncoding: {
            //         type: 'pkcs1',
            //         format: 'pem'
            //     },
            //     privateKeyEncoding: {
            //         type: 'pkcs1',
            //         format: 'pem'
            //     }
            // })

            const privateKey = crypto.randomBytes(64).toString('hex')
            const publicKey = crypto.randomBytes(64).toString('hex')

            console.log({ privateKey, publicKey }) // save collection keystore

            const keyStore = await KeyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey, privateKey
            })

            if (!keyStore) {
                return {
                    code: 'xxxx',
                    message: 'keyStore error'
                }
            }
            // created token pair
            const tokens = await createTokenPair({ userId: newShop._id, email }, publicKey, privateKey)
            console.log(`Create Token Success::`, tokens)

            return {
                code: 201,
                metadata: {
                    shop: getInfoData({ fileds: ['_id', 'name', 'email'], object: newShop }),
                    tokens
                }
            }
        }

        return {
            code: 200,
            metadata: null
        }

        // } catch (error) {
        //     return {
        //         code: 'xxx',
        //         message: error.message,
        //         status: 'error'
        //     }
        // }
    }
}

module.exports = AccessServices