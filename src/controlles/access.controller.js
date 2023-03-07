'use strict'

const AccessServices = require("../services/access.services")

class AccessController {

    signUp = async (req, res, next) => {
        try {
            console.log(`[P]::signUp::`, req.body)
            /*
            200 OK
            201 Created
            */
            return res.status(201).json(await AccessServices.signUp(req.body))
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new AccessController