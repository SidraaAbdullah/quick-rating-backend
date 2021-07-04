module.exports = {
  apps: [
    {
      name: 'quick-rating',
      script: './src/server.js',
      env: {
        PORT: 8080,
        NODE_ENV: 'staging',
        MONGODB_URL:
          'mongodb+srv://quickrating:@DeveloperQuickRating@cluster0.be1wm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
        CACHE_TIME: 180,
        CAN_VOTE_ALWAYS: false,
        PICTURES: true,
      },
    },
  ],
};
