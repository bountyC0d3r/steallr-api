const service = require('../services/AccountService')

async function getAccount (req, res) {
  try {
    const result = await service.getAccount(req.params.publicKey)
    res.send(result)
  } catch (error) {
    res.status(error.status || 400).json({
      type: 'error',
      message: error.message,
      error
    })
  }
}

async function createAccount (req, res) {
  try {
    const result = await service.createAccount()
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
  getAccount,
  createAccount
}
