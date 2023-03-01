'use strict'

const mongoose = require('mongoose')
const { db: { host, port, name } } = require('../configs/congif.mongdb')
const connectString = `mongodb://${host}:${port}/${name}`
const { countConnect } = require('../helpers/check.connect')

console.log('connectString', connectString)
class Datababse {
    constructor() {
        this.connect()
    }
    connect(type = 'mongodb') {
        if (1 === 1) {
            mongoose.set('debug', true)
            mongoose.set('debug', { color: true })
        }

        mongoose.connect(connectString, {
            maxPoolSize: 50
        }).then((_) => {
            console.log('Connected Mongodb Success', countConnect())
        }).catch((err) => console.log('Error Connect!'))
    }

    static getInstance() {
        if (!Datababse.instance) {
            Datababse.instance = new Datababse
        }
        return Datababse.instance
    }
}

const instanceMongodb = Datababse.getInstance()
module.exports = instanceMongodb