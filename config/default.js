/**
 * The configuration file.
 */

module.exports = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  HOST: process.env.HOST || 'localhost',
  PORT: process.env.PORT || 3000,
  API_PREFIX: process.env.API_PREFIX || '',
  ISSUER_MNEMONIC: process.env.ISSUER_MNEMONIC || 'throw borrow car involve struggle salad dawn tree assume guilt garlic filter',
  DISTRIBUTER_MNEMONIC: process.env.DISTRIBUTER_MNEMONIC || 'burden clarify below stem original tissue zebra hotel squirrel reject obtain neglect',
  // ISSUER_PUBLIC_KEY: process.env.ISSUER_PUBLIC_KEY || 'GAXIPGO4RBM4EI4HQ623FC3R3KMVK2DMWFJD6OM25OVLSSC346K3B6L5',
  API_VERSION: process.env.API_VERSION || '/api/v5'
}
