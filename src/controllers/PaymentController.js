const service = require('../services/PaymentService')

async function payment (req, res) {
  try {
    const result = await service.payment(req.body)
    res.send(result)
  } catch (error) {
    res.status(error.status || 400).json({
      type: 'error',
      message: error.message,
      error
    })
  }
}

async function paymentDetails (req, res) {
  try {
    const result = await service.paymentDetails(req.params.txHash)
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
  payment,
  paymentDetails
}
