'use strict'

const AccessServices = require("../services/access.services")

const { OK, CREATED, SuccessRespone } = require('../core/success.response')
class AccessController {

    login = async (req, res, next) => {
        new SuccessRespone({
            metadata: await AccessServices.login(req.body)
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