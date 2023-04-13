'use strict'

const mongoose = require('mongoose')
const conectString = 'mongodb://127.0.0.1:27017:27017/shopDEV'
mongoose.connect(conectString).then(_ => console.log('Connected Mongodb Success'))
    .catch(err => console.log('Error Connect!'))

//dev
if (1 === 1) {
    mongoose.set('debug', true)
    mongoose.set('debug', { color: true })
}
module.exports = mongoose