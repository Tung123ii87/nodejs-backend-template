require('dotenv').config();
const express = require('express')
const { default: helmet } = require('helmet')
const morgan = require('morgan')
const compression = require('compression')
const app = express()



// console.log(`Process::`, process.env)
//init middlewares
app.use(morgan('dev'))
app.use(helmet())
app.use(compression())

//init db
require('./dbs/init.mongodb')
// const { checkOverload } = require('./helpers/check.connect')
// checkOverload()
//init router
app.get('/', (req, res, next) => {
    // const strCompress = 'Hello everybody'
    return res.status(200).json({
        msg: 'Wellcome to home',
        // metadata: strCompress.repeat(10000)
    })
})

//handling error

module.exports = app