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
      controller: 'CoinController',
      method: 'payment'
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
