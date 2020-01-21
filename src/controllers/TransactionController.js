const service = require('../services/TransactionService')

async function createTrust (req, res) {
  try {
    const result = await service.createTrust(req.body)
    res.send(result)
  } catch (error) {
    res.status(error.status || 400).json({
      type: 'error',
      message: error.message,
      error
    })
  }
}

async function signTransaction (req, res) {
  try {
    const result = await service.signTransaction(req.body)
    res.send(result)
  } catch (error) {
    res.status(error.status || 400).json({
      type: 'error',
      message: error.message,
      error
    })
  }
}

async function submitTx (req, res) {
  try {
    const result = await service.submitTx(req.body)
    res.send(result)
  } catch (error) {
    res.status(error.status || 400).json({
      type: 'error',
      message: error.message,
      error
    })
  }
}

module.exports = {
  signTransaction,
  createTrust,
  submitTx
}
