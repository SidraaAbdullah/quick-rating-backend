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
      'mongodb+srv://dbUser:pourboir@123@cluster0.ugghn.mongodb.net/pourboir-v1-local?retryWrites=true&w=majority',
    ),
  },
  aws: {
    accessKeyId: 'AKIAXBF5SHG2GIK7FFWS',
    secretAccessKey: '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',
    bucketName: 'pourboir',
  },

  sendGrid: {
    apiKey: fromEnv(
      'SEND_GRID_API_KEY',
      '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',
    ),
    liveMode: false,
  },
  stripe: {
    publishableKey: fromEnv(
      'STRIPE_PUBLISHABLE_KEY',
      'pk_test_51ISM24C8eu0AeiYv0qduvQv1yO0uhVzv63agyGWH9I6fmWvZTVapZ8XwBbhDJeRhD6H7G9P1S5n2jQPkGxv9TtJH00sKhvyKC6',
    ),
    secretKey: fromEnv(
      'STRIPE_SECRET_KEY',
      'sk_test_51ISM24C8eu0AeiYvKe1svKAj0SZ21kuJHG3wYey1sOgcWfEQdLXG04qQRdz1FGJZUYX4Ru6Tp569LCz95UvSChVo00PywNBxHJ',
    ),
  },
  secret: 'supersecret',
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
