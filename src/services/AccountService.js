const stellar = require('stellar-sdk')
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

async function createEscrowAccount (data) {
  try {
    const mnemonic = wallet.generateMnemonic({ entropyBits: 128 })
    const account = wallet.fromMnemonic(mnemonic)

    const publicKey = account.getPublicKey(0)
    const secret = account.getSecret(0)

    const investorAccount = await helper.getServer().loadAccount(data.investorPublicKey)

    const escrowAccountConfig = {
      destination: publicKey,
      startingBalance: data.initialAmount
    }

    const txOptions = {
      fee: await helper.getServer().fetchBaseFee(),
      networkPassphrase: stellar.Networks.TESTNET
    }

    const transaction = new stellar.TransactionBuilder(investorAccount, txOptions)
      .addOperation(stellar.Operation.createAccount(escrowAccountConfig))
      .setTimeout(stellar.TimeoutInfinite)
      .build()

    const xdr = transaction.toEnvelope().toXDR('base64')
    return {
      mnemonic,
      publicKey,
      secret,
      message: "Save 'mnemonic' that will help to recover the 'secret' and 'publicKey'. Never share 'secret' with others",
      transaction: xdr
    }
  } catch (error) {
    logger.logFullError(error)
    throw error
  }
}

async function configEscrowAccount (data) {
  try {
    const thresholds = {
      masterWeight: 0,
      lowThreshold: data.signerCount,
      medThreshold: data.signerCount,
      highThreshold: data.signerCount
    }

    const txOptions = {
      fee: await helper.getServer().fetchBaseFee(),
      networkPassphrase: stellar.Networks.TESTNET
    }

    const escrowAccount = await helper.getServer().loadAccount(data.escrowPublicKey)
    let transaction = new stellar.TransactionBuilder(escrowAccount, txOptions)
    transaction = transaction.addOperation(stellar.Operation.setOptions(thresholds))

    for (const key of data.signers) {
      console.log(key)
      const signer = {
        signer: {
          ed25519PublicKey: key,
          weight: 1
        }
      }

      transaction = transaction.addOperation(stellar.Operation.setOptions(signer))
    }

    transaction = transaction.setTimeout(stellar.TimeoutInfinite).build()

    const xdr = transaction.toEnvelope().toXDR('base64')
    return { transaction: xdr }
  } catch (error) {
    logger.logFullError(error)
    throw error
  }
}

module.exports = {
  getAccount,
  createAccount,
  createEscrowAccount,
  configEscrowAccount
}
