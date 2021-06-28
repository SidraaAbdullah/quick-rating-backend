'use strict';

/* default.js, node-config default configuration.

   All application configuration variables should be represented herein, even
   if only to have default or empty value.

   If you would like to change any of these values for your dev environment, create
   a local.js file in this directory (which will be gitignored), in which individual
   properties can be specified which overwrite any of the values below.

*/

module.exports = {
  serve: {
    port: process.env.PORT || 3000,
    api: {
      cors: {
        whitelist: fromEnv('CORS_ALLOW_ORIGIN', ['http://localhost:3000'].join(',')),
      },
    },
  },

  datasource: {
    databaseUrl: fromEnv(
      'MONGODB_URL',
      'mongodb+srv://quickrating:@DeveloperQuickRating@cluster0.be1wm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
    ),
  },
  aws: {
    accessKeyId: 'AKIA2PRS6GBGMJ6ASZ5Q',
    secretAccessKey: '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',
    bucketName: 'quickrating',
  },

  sendGrid: {
    apiKey: fromEnv(
      'SEND_GRID_API_KEY',
      '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',
    ),
    liveMode: false,
  },
  stripe: {
    publishableKey: fromEnv('STRIPE_PUBLISHABLE_KEY', 'pk_test_'),
    secretKey: fromEnv('STRIPE_SECRET_KEY', 'sk_test_'),
  },
  secret: 'quickrating_supersecret',
};

// In production environments, read from the environment. Otherwise, use a
// default for development, allowing the value to be overridden.
function identity(x) {
  return x;
}

// Read from the environment, or use a default.
function fromEnv(varName, defValue, transform) {
  transform = transform || identity;
  const envValue = process.env[varName];
  if (envValue !== undefined) {
    return transform(envValue);
  }
  return defValue;
}
