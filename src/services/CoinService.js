const stellar = require('stellar-sdk')
const logger = require('../common/logger')
const helper = require('../common/helper')

async function createCoin (data) {
  try {
    const issuer = helper.getIssuerDetails()
    const distributer = helper.getDistributerDetails()

    const asset = new stellar.Asset(data.code, issuer.publicKey)
    const operation = await stellar.Operation.payment({
      asset: asset,
      destination: distributer.publicKey,
      amount: data.amount
    })

    const txOptions = {
      fee: await helper.getFees(),
      networkPassphrase: stellar.Networks.TESTNET
    }

    const issuerAccount = await helper.getServer().loadAccount(issuer.publicKey)
    const transaction = new stellar.TransactionBuilder(issuerAccount, txOptions)
      .addOperation(operation)
      .setTimeout(stellar.TimeoutInfinite)
      .build()

    transaction.sign(stellar.Keypair.fromSecret(issuer.secretKey))

    const server = helper.getServer()
    const transactionResult = await server.submitTransaction(transaction)
    return transactionResult
  } catch (error) {
    logger.logFullError(error)
    throw error.response.data
  }
}

async function sellCoin (data) {
  try {
    const issuer = helper.getIssuerDetails()
    const distributer = helper.getDistributerDetails()

    const sellingAsset = new stellar.Asset(data.code, issuer.publicKey)
    const buyingAsset = new stellar.Asset.native()

    const operation = await stellar.Operation.manageSellOffer({
      selling: sellingAsset,
      buying: buyingAsset,
      price: data.price, // 0.2,
      offerId: 0,
      amount: data.amount // '5000'
    })

    const txOptions = {
      fee: await helper.getFees(),
      networkPassphrase: stellar.Networks.TESTNET
    }
    const account = await helper.getServer().loadAccount(distributer.publicKey)

    const transaction = new stellar.TransactionBuilder(account, txOptions)
      .addOperation(operation)
      .setTimeout(stellar.TimeoutInfinite)
      .build()

    transaction.sign(stellar.Keypair.fromSecret(distributer.secretKey))

    const transactionResult = await helper.getServer().submitTransaction(transaction)
    return transactionResult
  } catch (error) {
    logger.logFullError(error)
    throw error.response.data
  }
}

async function buyCoin (data) {
  try {
    const issuer = helper.getIssuerDetails()

    const buyingAsset = new stellar.Asset(data.code, issuer.publicKey)
    const sellingAsset = new stellar.Asset.native()

    const operation = await stellar.Operation.manageSellOffer({
      selling: sellingAsset,
      buying: buyingAsset,
      price: data.price, // 5,
      offerId: 0,
      amount: data.amount // '500'
    })

    const txOptions = {
      fee: await helper.getFees(),
      networkPassphrase: stellar.Networks.TESTNET
    }
    const account = await helper.getServer().loadAccount(data.investorPublicKey)

    const transaction = new stellar.TransactionBuilder(account, txOptions)
      .addOperation(operation)
      .setTimeout(stellar.TimeoutInfinite)
      .build()

    transaction.sign(stellar.Keypair.fromSecret(data.investorSecretKey))

    const transactionResult = await helper.getServer().submitTransaction(transaction)
    return transactionResult
  } catch (error) {
    logger.logFullError(error)
    throw error.response.data
  }
}

module.exports = {
  createCoin,
  sellCoin,
  buyCoin
}
