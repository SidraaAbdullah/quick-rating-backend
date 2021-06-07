module.exports = {
  apps: [
    {
      name: 'pourboir',
      script: './src/server.js',
      env: {
        PORT: 8080,
        NODE_ENV: 'staging',
        MONGODB_URL:
          'mongodb+srv://quickrating:@DeveloperQuickRating@cluster0.be1wm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
        CACHE_TIME: 120,
        CAN_VOTE_ALWAYS: false,
        PICTURES: true,
      },
    },
    {
      name: 'pourboir-production',
      script: './src/server.js',
      args: 'run start',
      watch: false,
      env: {
        PORT: 5000,
        NODE_ENV: 'production',
        MONGODB_URL:
          'mongodb+srv://quickrating:@DeveloperQuickRating@cluster0.be1wm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
        EMAIL_TO: 'contact@pourboir.com',
        GOOGLE_API_KEY: 'AIzaSyBAPptEr4vCABmo5yyiEeoF2cT8mx5Wimc',
        CACHE_TIME: 60,
        CAN_VOTE_ALWAYS: false,
        PICTURES: true,
      },
    },
  ],
};
