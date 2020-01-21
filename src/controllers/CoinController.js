const service = require('../services/CoinService')

async function createCoin (req, res) {
  try {
    const result = await service.createCoin(req.body)
    res.send(result)
  } catch (error) {
    res.status(error.status || 400).json({
      type: 'error',
      message: error.message,
      error
    })
  }
}

async function sellCoin (req, res) {
  try {
    const result = await service.sellCoin(req.body)
    res.send(result)
  } catch (error) {
    res.status(error.status || 400).json({
      type: 'error',
      message: error.message,
      error
    })
  }
}

async function buyCoin (req, res) {
  try {
    const result = await service.buyCoin(req.body)
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
  createCoin,
  sellCoin,
  buyCoin
}
