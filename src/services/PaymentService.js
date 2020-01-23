const stellar = require('stellar-sdk')
const logger = require('../common/logger')
const helper = require('../common/helper')

async function payment (data) {
  try {
    const issuerAccount = helper.getIssuerDetails()
    const asset = new stellar.Asset(data.code, issuerAccount.publicKey)

    const memo = stellar.Memo.text('payment')
    const txOptions = {
      memo,
      fee: await helper.getServer().fetchBaseFee(),
      networkPassphrase: stellar.Networks.TESTNET
    }

    const operation = await stellar.Operation.payment({
      asset: asset,
      destination: data.destinationPublicKey,
      amount: data.amount
    })

    const sourceAccount = await helper.getServer().loadAccount(data.sourcePublicKey)
    const transaction = new stellar.TransactionBuilder(sourceAccount, txOptions)
      .addOperation(operation)
      .setTimeout(stellar.TimeoutInfinite)
      .build()

    const xdr = transaction.toEnvelope().toXDR('base64')
    return { transaction: xdr }
  } catch (error) {
    logger.logFullError(error)
    throw error
  }
}

async function paymentDetails (txHash) {
  console.log(txHash)
  const request = await helper.getServer().payments().forTransaction(txHash)
  const transaction = await request.call()
  return transaction
}

module.exports = {
  payment,
  paymentDetails
}
