const request = require('async-request')
const wallet = require('stellar-hd-wallet')

const helper = require('../common/helper')
const logger = require('../common/logger')

async function getAccount (publicKey) {
  try {
    const account = await helper.getServer().loadAccount(publicKey)
    return account.balances
  } catch (error) {
    logger.logFullError(error)
    throw error
  }
}

async function createAccount () {
  try {
    const mnemonic = wallet.generateMnemonic({ entropyBits: 128 })
    const account = wallet.fromMnemonic(mnemonic)

    // use friendbot for creating the account and get it funded
    await request(`https://friendbot.stellar.org?addr=${encodeURIComponent(account.getPublicKey(0))}`)

    return {
      mnemonic,
      publicKey: account.getPublicKey(0),
      secret: account.getSecret(0),
      message: "Save 'mnemonic' that will help to recover the 'secret' and 'publicKey'. Never share 'secret' with others"
    }
  } catch (error) {
    logger.logFullError(error)
    throw error
  }
}

module.exports = {
  getAccount,
  createAccount
}
