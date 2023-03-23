'use strict'

const AccessServices = require("../services/access.services")

const { OK, CREATED, SuccessRespone } = require('../core/success.response')
class AccessController {

    handlerRefreshToken = async (req, res, next) => {
        // new SuccessRespone({
        //     message: 'Get token success!',
        //     metadata: await AccessServices.handlerRefreshToken(req.body.refreshToken)
        // }).send(res)

        // V2 fixed, no need accesstoken

        new SuccessRespone({
            message: 'Get token success!',
            metadata: await AccessServices.handlerRefreshTokenV2({
                refreshToken: req.refreshToken,
                user: req.user,
                keyStore: req.keyStore
            })
        }).send(res)
    }

    login = async (req, res, next) => {
        new SuccessRespone({
            metadata: await AccessServices.login(req.body)
        }).send(res)
    }

    logout = async (req, res, next) => {
        new SuccessRespone({
            message: 'Logout success!',
            metadata: await AccessServices.logout(req.keyStore)
        }).send(res)
    }

    signUp = async (req, res, next) => {
        // return res.status(200).json({
        //     message: metadata
        // })
        new CREATED({
            message: 'Registerted OK!',
            metadata: await AccessServices.signUp(req.body),
            options: {
                limit: 10
            }
        }).send(res)
    }

}

module.exports = new AccessController