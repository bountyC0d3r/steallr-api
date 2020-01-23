/**
 * Contains all routes
 */

module.exports = {
  '/coins': {
    post: {
      controller: 'CoinController',
      method: 'createCoin'
    }
  },

  '/coins/sell': {
    post: {
      controller: 'CoinController',
      method: 'sellCoin'
    }
  },

  '/coins/buy': {
    post: {
      controller: 'CoinController',
      method: 'buyCoin'
    }
  },

  '/payment': {
    post: {
      controller: 'PaymentController',
      method: 'payment'
    }
  },

  '/payment/:txHash': {
    get: {
      controller: 'PaymentController',
      method: 'paymentDetails'
    }
  },

  '/account/:publicKey': {
    get: {
      controller: 'AccountController',
      method: 'getAccount'
    }
  },
  '/account': {
    post: {
      controller: 'AccountController',
      method: 'createAccount'
    }
  },
  '/account/escrow': {
    post: {
      controller: 'AccountController',
      method: 'createEscrowAccount'
    },
    put: {
      controller: 'AccountController',
      method: 'configEscrowAccount'
    }
  },

  '/transactions/:publicKey': {
    get: {
      controller: 'TransactionController',
      method: 'list'
    }
  },

  '/transaction/:txHash': {
    get: {
      controller: 'TransactionController',
      method: 'txDetails'
    }
  },

  '/transaction/sign': {
    post: {
      controller: 'TransactionController',
      method: 'signTransaction'
    }
  },
  '/transaction/trust': {
    post: {
      controller: 'TransactionController',
      method: 'createTrust'
    }
  },
  '/transaction/submit': {
    post: {
      controller: 'TransactionController',
      method: 'submitTx'
    }
  }
}
