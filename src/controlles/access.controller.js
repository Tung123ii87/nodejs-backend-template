'use strict'

class AccessController {

    signUp = async (req, res, next) => {
        try {
            console.log(`[P]::signUp::`, req.body)
            /*
            200 OK
            201 Created
            */
            return res.status(200).json({
                code: '2001',
                metadata: { userid: 1 }
            })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new AccessController