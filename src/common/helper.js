/**
 * Contains generic helper methods
 */

const _ = require('lodash')
const co = require('co')
const config = require('config')
const stellar = require('stellar-sdk')
const wallet = require('stellar-hd-wallet')
const server = new stellar.Server('https://horizon-testnet.stellar.org')

function getServer () {
  return server
}

async function getFees () {
  return server.fetchBaseFee()
}

function getIssuerDetails () {
  const account = wallet.fromMnemonic(config.ISSUER_MNEMONIC)
  return {
    publicKey: account.getPublicKey(0),
    secretKey: account.getSecret(0)
  }
}

function getDistributerDetails () {
  const account = wallet.fromMnemonic(config.DISTRIBUTER_MNEMONIC)
  return {
    publicKey: account.getPublicKey(0),
    secretKey: account.getSecret(0)
  }
}

/**
 * Wrap generator function to standard express function
 * @param {Function} fn the generator function
 * @returns {Function} the wrapped function
 */
function wrapExpress (fn) {
  return function wrap (req, res, next) {
    co(fn(req, res, next)).catch(next)
  }
}

/**
 * Wrap all generators from object
 * @param obj the object (controller exports)
 * @returns {Object|Array} the wrapped object
 */
function autoWrapExpress (obj) {
  if (_.isArray(obj)) {
    return obj.map(autoWrapExpress)
  }
  if (_.isFunction(obj)) {
    if (obj.constructor.name === 'GeneratorFunction') {
      return wrapExpress(obj)
    }
    return obj
  }
  _.each(obj, (value, key) => {
        obj[key] = autoWrapExpress(value); //eslint-disable-line
  })
  return obj
}

module.exports = {
  wrapExpress,
  autoWrapExpress,
  getServer,
  getFees,
  getIssuerDetails,
  getDistributerDetails
}
