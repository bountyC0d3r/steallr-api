/**
 * App bootstrap
 */
require('./app-bootstrap')

const _ = require('lodash')
const bodyParser = require('body-parser')
const config = require('config')
const cors = require('cors')
const express = require('express')
const httpStatus = require('http-status-codes')

const app = express()

const errorMiddleware = require('./src/common/errors')
const logger = require('./src/common/logger')
const helper = require('./src/common/helper')
const routes = require('./src/routes')

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.set('port', config.PORT)

const apiRouter = express.Router()

/* eslint-disable no-param-reassign */
_.each(routes, (verbs, url) => {
  _.each(verbs, (def, verb) => {
    let actions = [
      (req, res, next) => {
        req.signature = `${def.controller}#${def.method}`
        next()
      }
    ]
    const method = require(`./src/controllers/${def.controller}`)[ def.method ]; // eslint-disable-line

    if (!method) {
      throw new Error(`${def.method} is undefined, for controller ${def.controller}`)
    }
    if (def.middleware && def.middleware.length > 0) {
      actions = actions.concat(def.middleware)
    }

    actions.push(method)
    logger.info(`API : ${verb.toLocaleUpperCase()} ${config.API_VERSION}${url}`)
    apiRouter[verb](`${config.API_VERSION}${url}`, helper.autoWrapExpress(actions))
  })
})
/* eslint-enable no-param-reassign */

app.use('/', apiRouter)
app.use(errorMiddleware())

// Check if the route is not found or HTTP method is not supported
app.use('*', (req, res) => {
  const pathKey = req.baseUrl.substring(config.API_VERSION.length)
  const route = routes[pathKey]
  if (route) {
    res.status(httpStatus.METHOD_NOT_ALLOWED).json({ message: 'The requested HTTP method is not supported.' })
  } else {
    res.status(httpStatus.NOT_FOUND).json({ message: 'The requested resource cannot be found.' })
  }
})

app.listen(app.get('port'), () => {
  logger.info(`Express server listening on port ${app.get('port')}`)
})
