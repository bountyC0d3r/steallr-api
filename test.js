const request = require('async-request')
const wallet = require('stellar-hd-wallet')
const stellarSdk = require('stellar-sdk')
const server = new stellarSdk.Server('https://horizon-testnet.stellar.org')
const fs = require('fs')

// const network = stellarSdk.Networks.TESTNET
// console.log(network)

const accounts = {
  issuer: {
    publicKey: 'GAGMFFUTKW7CMHU5PQC7DOQQAQAAOZXHJSCANVG3LIOYVSMATIV4IH4E',
    secretKey: 'SBAAWSXDMZCBMZY5UIWZ2O7ER5ELNY5UICT2P2JLNKYELHLNI5AYVDNW'
  },
  distributer: {
    publicKey: 'GAM2P3YNWB4U7U2B2ZAVORT3KHPMOWF2YHGDERIUXGJ4H6TLQVZPIL4R',
    secretKey: 'SA2YSLKK6WITFINP5YGN4A2LIMFRRI3ZAIEAR5D7PZXCJIXPCITK4EVA'
  },
  investor: {
    publicKey: 'GC4KQJVBRNG36ZTEE2NDYMVYK35Y77JHDFTNHUQV4KUBGHPECGETR6C7',
    secretKey: 'SA2MUPWHCTIV3WSYOCFF5AJ7DTYGBG2HSGABJ5YXPOE3XKHUQSBYIMY6'
  },
  member1: { // 400
    publicKey: 'GDPB3NAMIMHOAQ6CIOJ4EW6MLM2P2SJABNPUCOCFITNPCNKKNJ7VKYSG',
    secretKey: 'SDLGIJGBAFBEJKQISQ4EIWRA5ET7FOUZUMGOGVRLHPINEUENDZYRZKSK'
  },
  member2: { // 10
    publicKey: 'GBIUR367C7QTLS2F5TSJJAIB4S22AWC5NKUU7ZZ4RSXMECXAD7623E32',
    secretKey: 'SB6FOUVJJOXAPXOMCQ67UCLV2RCVVL37OUWDJR2NEUQRXGDTEXJEYXOT'
  },
  member3: { // 0
    publicKey: 'GCWUQ2KMT3YW72J545FPDZ23DMBMIAHH7MVCCGRN4KKXJSOH7WSC32VM',
    secretKey: 'SC63OGTAWCTJZKK56GE5IOJ5PNDJDYZCAG7SPSUW3H7NEGMFMRUNQZW2'
  },
  escrow: {
    publicKey: 'GA5MTNFVTPRMERBIHI57NLAKQ3SR7QGGRUU32ZBLLO4OY6A5IFRDP23H',
    secretKey: 'SD53DEATCXXQNSGFZBZ236OK2QSG6G523QXNIAJAWI7LRVKGGCWJHBY7'
  }
}

async function createAccount (name) {
  // create keypair for new account
  const pair = stellarSdk.Keypair.random()

  console.log(`Details for ${name} account:`)
  console.log(`publicKey = ${pair.publicKey()}`)
  console.log(`secret = ${pair.secret()}`)

  // use friendbot for creating the account and get it funded
  const response = await request(
    `https://friendbot.stellar.org?addr=${encodeURIComponent(pair.publicKey())}`
  )
  console.log(response)
}

async function getAccountDetails (publicKey) {
  // get the account details for the given publicKey
  const account = await server.loadAccount(publicKey)
  account.balances.forEach(function (balance) {
    console.log(balance)
  })
}

async function getSequenceNumber (publicKey) {
  console.log('get sequence number')
  const account = await server.loadAccount(publicKey)
  const seqNumber = await account.sequenceNumber()
  console.log(seqNumber)
}

async function createTrust (sourceAccount) {
  console.log('create trust')
  const asset = new stellarSdk.Asset('tctoken', accounts.issuer.publicKey)

  const operation = await stellarSdk.Operation.changeTrust({
    asset: asset
  })

  const fee = await server.fetchBaseFee()
  const account = await server.loadAccount(sourceAccount.publicKey)

  const transaction = new stellarSdk.TransactionBuilder(account,
    {
      fee,
      networkPassphrase: stellarSdk.Networks.TESTNET
    }).addOperation(operation).setTimeout(30).build()

  transaction.sign(stellarSdk.Keypair.fromSecret(sourceAccount.secretKey))
  try {
    const transactionResult = await server.submitTransaction(transaction)
    console.log(JSON.stringify(transactionResult))
  } catch (err) {
    console.log('error')
    console.error(err.response.data.extras.result_codes)
  }
}

async function createToken () {
  console.log('create token')
  const asset = new stellarSdk.Asset('tctoken', accounts.issuer.publicKey)

  console.log(asset)
  const operation = await stellarSdk.Operation.payment({
    asset: asset,
    destination: accounts.distributer.publicKey,
    amount: '100000'
  })

  const fee = await server.fetchBaseFee()
  const account = await server.loadAccount(accounts.issuer.publicKey)

  const transaction = new stellarSdk.TransactionBuilder(account,
    {
      fee,
      networkPassphrase: stellarSdk.Networks.TESTNET
    }).addOperation(operation).setTimeout(30).build()

  transaction.sign(stellarSdk.Keypair.fromSecret(accounts.issuer.secretKey))
  try {
    const transactionResult = await server.submitTransaction(transaction)
    console.log(JSON.stringify(transactionResult))
  } catch (err) {
    console.log('error')
    console.error(err.response.data.extras.result_codes)
  }
}

async function sellToken () {
  console.log('create token')
  const sellingAsset = new stellarSdk.Asset('TCBaseToken', accounts.issuer.publicKey)
  const buyingAsset = new stellarSdk.Asset.native()

  // console.log(asset)
  const operation = await stellarSdk.Operation.manageSellOffer({
    selling: sellingAsset,
    buying: buyingAsset,
    price: 0.2,
    offerId: 0,
    amount: '10000'
  })

  console.log(operation)

  const fee = await server.fetchBaseFee()
  console.log(fee)
  const account = await server.loadAccount(accounts.distributer.publicKey)
  console.log(account)

  const transaction = new stellarSdk.TransactionBuilder(account,
    {
      fee,
      networkPassphrase: stellarSdk.Networks.TESTNET
    }).addOperation(operation).setTimeout(stellarSdk.TimeoutInfinite).build()

  transaction.sign(stellarSdk.Keypair.fromSecret(accounts.distributer.secretKey))
  try {
    const transactionResult = await server.submitTransaction(transaction)
    console.log(JSON.stringify(transactionResult))
  } catch (err) {
    console.log('error')
    console.error(err.response.data.extras.result_codes)
  }
}

async function buyToken () {
  await createTrust(accounts.investor)

  // console.log('create token')
  const sellingAsset = new stellarSdk.Asset('TCBaseToken', accounts.issuer.publicKey)
  const buyingAsset = new stellarSdk.Asset.native()

  // console.log(asset)
  const operation = await stellarSdk.Operation.manageBuyOffer({
    buying: sellingAsset,
    selling: buyingAsset,
    price: 5,
    offerId: 0,
    buyAmount: '1000'
  })

  console.log(operation)

  const fee = await server.fetchBaseFee()
  console.log(fee)
  const account = await server.loadAccount(accounts.investor.publicKey)
  console.log(account)

  const transaction = new stellarSdk.TransactionBuilder(account,
    {
      fee,
      networkPassphrase: stellarSdk.Networks.TESTNET
    }).addOperation(operation).setTimeout(30).build()

  transaction.sign(stellarSdk.Keypair.fromSecret(accounts.investor.secretKey))
  try {
    const transactionResult = await server.submitTransaction(transaction)
    console.log(JSON.stringify(transactionResult))
  } catch (err) {
    console.log('error')
    console.error(err.response.data.extras.result_codes)
  }
}

async function payToMember () {
  await createTrust(accounts.escrow)

  console.log('create token')
  const asset = new stellarSdk.Asset('TCBaseToken', accounts.issuer.publicKey)

  console.log(asset)
  const operation = await stellarSdk.Operation.payment({
    asset: asset,
    destination: accounts.escrow.publicKey,
    amount: '1'
  })

  console.log(operation)

  const fee = await server.fetchBaseFee()
  console.log(fee)
  const account = await server.loadAccount(accounts.investor.publicKey)
  console.log(account)

  const transaction = new stellarSdk.TransactionBuilder(account,
    {
      fee,
      networkPassphrase: stellarSdk.Networks.TESTNET
    }).addOperation(operation).setTimeout(30).build()

  transaction.sign(stellarSdk.Keypair.fromSecret(accounts.investor.secretKey))
  try {
    const transactionResult = await server.submitTransaction(transaction)
    console.log(JSON.stringify(transactionResult))
  } catch (err) {
    console.log('error')
    console.error(err.response.data.extras.result_codes)
  }
}

async function createEscrowAccount () {
  const escrowKeyPair = stellarSdk.Keypair.random()
  const account = await server.loadAccount(accounts.investor.publicKey)
  console.log(escrowKeyPair.publicKey())
  console.log(escrowKeyPair.secret())

  const escrowAccountConfig = {
    destination: escrowKeyPair.publicKey(),
    startingBalance: '3.5000000'
  }

  const txOptions = {
    fee: await server.fetchBaseFee(),
    networkPassphrase: stellarSdk.Networks.TESTNET
  }

  const transaction = new stellarSdk.TransactionBuilder(account, txOptions)
    .addOperation(stellarSdk.Operation.createAccount(escrowAccountConfig))
    .setTimeout(stellarSdk.TimeoutInfinite)
    .build()

  transaction.sign(stellarSdk.Keypair.fromSecret(accounts.investor.secretKey))

  try {
    const transactionResult = await server.submitTransaction(transaction)
    console.log(JSON.stringify(transactionResult))
  } catch (err) {
    console.log('error')
    console.error(err.response.data.extras.result_codes)
  }
}

async function configEscrowAccount () {
  await createTrust(accounts.escrow)

  const thresholds = {
    masterWeight: 0,
    lowThreshold: 1,
    medThreshold: 1,
    highThreshold: 1
  }

  const investorSigner = {
    signer: {
      ed25519PublicKey: accounts.investor.publicKey,
      weight: 1
    }
  }

  const member1Signer = {
    signer: {
      ed25519PublicKey: accounts.member1.publicKey,
      weight: 1
    }
  }

  const member3Signer = {
    signer: {
      ed25519PublicKey: accounts.member3.publicKey,
      weight: 1
    }
  }

  const txOptions = {
    fee: await server.fetchBaseFee(),
    networkPassphrase: stellarSdk.Networks.TESTNET
  }

  const escrowAccount = await server.loadAccount(accounts.escrow.publicKey)

  const transaction = new stellarSdk.TransactionBuilder(escrowAccount, txOptions)
    .addOperation(stellarSdk.Operation.setOptions(thresholds))
    .addOperation(stellarSdk.Operation.setOptions(investorSigner))
    .setTimeout(stellarSdk.TimeoutInfinite)
    .build()

  transaction.sign(stellarSdk.Keypair.fromSecret(accounts.escrow.secretKey))
  try {
    const transactionResult = await server.submitTransaction(transaction)
    console.log(JSON.stringify(transactionResult))
  } catch (err) {
    console.log('error')
    console.error(err.response.data.extras.result_codes)
  }
}

async function payToEscrow () {
  const asset = new stellarSdk.Asset('TCBaseToken', accounts.issuer.publicKey)

  console.log(asset)
  const operation = await stellarSdk.Operation.payment({
    asset: asset,
    destination: accounts.escrow.publicKey,
    amount: '150'
  })

  const txOptions = {
    fee: await server.fetchBaseFee(),
    networkPassphrase: stellarSdk.Networks.TESTNET
  }

  const investorAccount = await server.loadAccount(accounts.investor.publicKey)
  const transaction = new stellarSdk.TransactionBuilder(investorAccount, txOptions)
    .addOperation(operation)
    .setTimeout(stellarSdk.TimeoutInfinite)
    .build()

  transaction.sign(stellarSdk.Keypair.fromSecret(accounts.investor.secretKey))
  try {
    const transactionResult = await server.submitTransaction(transaction)
    console.log(JSON.stringify(transactionResult))
  } catch (err) {
    console.log('error')
    console.error(err.response.data.extras.result_codes)
  }
}

async function releaseToFirst () {
  const asset = new stellarSdk.Asset('TCBaseToken', accounts.issuer.publicKey)

  const paymentToFirst = {
    destination: accounts.member1.publicKey,
    asset: asset,
    amount: '100.0000000'
  }

  const txOptions = {
    fee: await server.fetchBaseFee(),
    networkPassphrase: stellarSdk.Networks.TESTNET
  }

  const escrowAccount = await server.loadAccount(accounts.escrow.publicKey)
  const transaction = new stellarSdk.TransactionBuilder(escrowAccount, txOptions)
    .addOperation(stellarSdk.Operation.payment(paymentToFirst))
    .setTimeout(stellarSdk.TimeoutInfinite)
    .build()

  const txEnvelopeXDR = transaction.toEnvelope().toXDR('base64')
  await fs.writeFileSync('releaseToFirst.txt', txEnvelopeXDR, { encoding: 'base64' })
}

async function releaseToSecond () {
  const asset = new stellarSdk.Asset('TCBaseToken', accounts.issuer.publicKey)

  const paymentToFirst = {
    destination: accounts.member3.publicKey,
    asset: asset,
    amount: '10'
  }

  const txOptions = {
    fee: await server.fetchBaseFee(),
    networkPassphrase: stellarSdk.Networks.TESTNET
  }

  const escrowAccount = await server.loadAccount(accounts.escrow.publicKey)
  const transaction = new stellarSdk.TransactionBuilder(escrowAccount, txOptions)
    .addOperation(stellarSdk.Operation.payment(paymentToFirst))
    .setTimeout(stellarSdk.TimeoutInfinite)
    .build()

  const txEnvelopeXDR = transaction.toEnvelope().toXDR('base64')
  await fs.writeFileSync('releaseToSecond.txt', txEnvelopeXDR, { encoding: 'base64' })
}

async function investorSignsTx () {
  const releaseToFirstTx = await fs.readFileSync('./releaseToFirst.txt', { encoding: 'base64' })
  const firstBuffer = Buffer.from(releaseToFirstTx, 'base64')
  const firstEnvelope = stellarSdk.xdr.TransactionEnvelope.fromXDR(firstBuffer, 'base64')
  const firstTransaction = new stellarSdk.Transaction(firstEnvelope, stellarSdk.Networks.TESTNET)
  firstTransaction.sign(stellarSdk.Keypair.fromSecret(accounts.investor.secretKey))
  const firstTxEnvelopeXDR = firstTransaction.toEnvelope().toXDR('base64')
  await fs.writeFileSync('releaseToFirstSignedByInv.txt', firstTxEnvelopeXDR, { encoding: 'base64' })

  const releaseToSecondTx = await fs.readFileSync('./releaseToSecond.txt', { encoding: 'base64' })
  const secondBuffer = Buffer.from(releaseToSecondTx, 'base64')
  const secondEnvelope = stellarSdk.xdr.TransactionEnvelope.fromXDR(secondBuffer, 'base64')
  const secondTransaction = new stellarSdk.Transaction(secondEnvelope, stellarSdk.Networks.TESTNET)
  secondTransaction.sign(stellarSdk.Keypair.fromSecret(accounts.investor.secretKey))
  const secondTxEnvelopeXDR = secondTransaction.toEnvelope().toXDR('base64')
  await fs.writeFileSync('releaseToSecondSignedByInv.txt', secondTxEnvelopeXDR, { encoding: 'base64' })
}

async function updateEscrowAccount () {
  const thresholds = {
    masterWeight: 0,
    lowThreshold: 2,
    medThreshold: 2,
    highThreshold: 2
  }

  const investorSigner = {
    signer: {
      ed25519PublicKey: accounts.investor.publicKey,
      weight: 1
    }
  }

  const member1Signer = {
    signer: {
      ed25519PublicKey: accounts.member1.publicKey,
      weight: 1
    }
  }

  const member3Signer = {
    signer: {
      ed25519PublicKey: accounts.member3.publicKey,
      weight: 1
    }
  }

  const txOptions = {
    fee: await server.fetchBaseFee(),
    networkPassphrase: stellarSdk.Networks.TESTNET
  }

  const escrowAccount = await server.loadAccount(accounts.escrow.publicKey)

  const transaction = new stellarSdk.TransactionBuilder(escrowAccount, txOptions)
    .addOperation(stellarSdk.Operation.setOptions(thresholds))
    .addOperation(stellarSdk.Operation.setOptions(investorSigner))
    .addOperation(stellarSdk.Operation.setOptions(member1Signer))
    .addOperation(stellarSdk.Operation.setOptions(member3Signer))
    .setTimeout(stellarSdk.TimeoutInfinite)
    .build()

  transaction.sign(stellarSdk.Keypair.fromSecret(accounts.investor.secretKey))
  try {
    const transactionResult = await server.submitTransaction(transaction)
    console.log(JSON.stringify(transactionResult))
  } catch (err) {
    console.log('error')
    console.error(err.response.data.extras.result_codes)
  }
}

async function withDrawFirst () {
  const releaseToFirstTx = await fs.readFileSync('./releaseToFirstSignedByInv.txt', { encoding: 'base64' })
  const firstBuffer = Buffer.from(releaseToFirstTx, 'base64')
  const firstEnvelope = stellarSdk.xdr.TransactionEnvelope.fromXDR(firstBuffer, 'base64')
  const firstTransaction = new stellarSdk.Transaction(firstEnvelope, stellarSdk.Networks.TESTNET)
  firstTransaction.sign(stellarSdk.Keypair.fromSecret(accounts.member1.secretKey))
  try {
    const transactionResult = await server.submitTransaction(firstTransaction)
    console.log(JSON.stringify(transactionResult))
  } catch (err) {
    console.log('error')
    console.error(err.response.data.extras.result_codes)
  }
}

async function withDrawSecond () {
  const releaseToSecondTx = await fs.readFileSync('./releaseToSecondSignedByInv.txt', { encoding: 'base64' })
  const secondBuffer = Buffer.from(releaseToSecondTx, 'base64')
  const secondEnvelope = stellarSdk.xdr.TransactionEnvelope.fromXDR(secondBuffer, 'base64')
  const secondTransaction = new stellarSdk.Transaction(secondEnvelope, stellarSdk.Networks.TESTNET)
  secondTransaction.sign(stellarSdk.Keypair.fromSecret(accounts.member3.secretKey))
  try {
    const transactionResult = await server.submitTransaction(secondTransaction)
    console.log(JSON.stringify(transactionResult))
  } catch (err) {
    console.log('error')
    console.error(err.response.data.extras.result_codes)
  }
}

// step:1 - create accounts
// createAccount('issuer')
// createAccount('distributer')
// createAccount('investor')
// createAccount('member1')
// createAccount('member2')
// createAccount('member3')

// step:2 - Distributor trust Issuer
// createTrust(accounts.distributer)

// step:3 - Create Token (Issuer to Distributer)
// createToken()

// step:4 - Sell Token
// sellToken()

// step:4 - Buy Token
// buyToken()

// step:5 - Pay to member
// payToMember()

// getAccountDetails(accounts.investor.publicKey)
// getAccountDetails(accounts.distributer.publicKey)
// getAccountDetails(accounts.escrow.publicKey)
// getAccountDetails(accounts.member1.publicKey)
// getAccountDetails(accounts.member2.publicKey)
// getAccountDetails(accounts.member3.publicKey)

// createEscrowAccount()
// configEscrowAccount()
// payToEscrow()

// updateEscrowAccount()

// releaseToFirst()
// releaseToSecond()
// investorSignsTx()
// withDrawFirst()
// withDrawSecond()

// async function getLedger () {
//   const res = await server.payments().forAccount(accounts.investor.publicKey)
//   const r = await res.call()
//   console.log(r)
// }

// getLedger()

// const mnemonic = wallet.generateMnemonic({ entropyBits: 128 })
// console.log(mnemonic)

// const mnemonic = 'derive gentle paper notice plastic one educate talent pulp file hospital february'
// const account = wallet.fromMnemonic(mnemonic)

// console.log(account.getPublicKey(0))
// console.log(account.getSecret(0))
