module.exports = {
  apps: [
    {
      name: 'pourboir',
      script: './src/server.js',
      env: {
        PORT: 8080,
        NODE_ENV: 'staging',
        MONGODB_URL:
          'mongodb+srv://dbUser:pourboir@123@cluster0.ugghn.mongodb.net/pourboir-v1-qa?retryWrites=true&w=majority',
        GOOGLE_API_KEY: 'AIzaSyCyzRS-qqJSeMlAdna0z_5a_gPxnBbqK6I',
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
          'mongodb+srv://dbUser:pourboir@123@cluster0.ugghn.mongodb.net/pourboir-v1-production?retryWrites=true&w=majority',
        EMAIL_TO: 'contact@pourboir.com',
        GOOGLE_API_KEY: 'AIzaSyDHVUwmNlKIiTNhnOi8xzM_vnsilLrJhkA',
        CACHE_TIME: 60,
        CAN_VOTE_ALWAYS: false,
        PICTURES: true,
      },
    },
  ],
};
