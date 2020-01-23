const stellar = require('stellar-sdk')
const helper = require('../common/helper')
const logger = require('../common/logger')

async function createTrust (data) {
  try {
    const issuer = helper.getIssuerDetails()

    const asset = new stellar.Asset(data.code, issuer.publicKey)
    const operation = await stellar.Operation.changeTrust({
      asset: asset
    })

    const txOptions = {
      fee: await helper.getFees(),
      networkPassphrase: stellar.Networks.TESTNET
    }

    const account = await helper.getServer().loadAccount(data.publicKey)
    const transaction = new stellar.TransactionBuilder(account, txOptions)
      .addOperation(operation)
      .setTimeout(stellar.TimeoutInfinite)
      .build()

    const xdr = transaction.toEnvelope().toXDR('base64')

    return { transaction: xdr }
  } catch (error) {
    logger.logFullError(error)
    throw error.response.data
  }
}

async function signTransaction (data) {
  try {
    const tx = new stellar.Transaction(data.transaction, stellar.Networks.TESTNET)

    tx.sign(stellar.Keypair.fromSecret(data.secret))
    const xdr = tx.toEnvelope().toXDR('base64')
    return { transaction: xdr }
  } catch (error) {
    logger.logFullError(error)
    throw error.response.data
  }
}

async function submitTx (data) {
  try {
    const tx = new stellar.Transaction(data.transaction, stellar.Networks.TESTNET)

    const transactionResult = await helper.getServer().submitTransaction(tx)
    return transactionResult
  } catch (error) {
    logger.logFullError(error)
    throw error.response.data
  }
}

async function list (account) {
  const request = await helper.getServer().transactions().forAccount(account)
  const transactions = await request.call()
  return transactions
}

async function txDetails (txHash) {
  console.log(txHash)
  const request = await helper.getServer().transactions().transaction(txHash)
  const transaction = await request.call()
  return transaction
}

module.exports = {
  signTransaction,
  createTrust,
  submitTx,
  list,
  txDetails
}
