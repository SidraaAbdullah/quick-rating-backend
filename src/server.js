const express = require('express');
const mongoose = require('mongoose');
const config = require('config');
const appRoot = require('app-root-path');
const cors = require('cors');
const rootLogger = require(appRoot + '/src/logger').rootLogger;
const http = require('http');
const app = express();
const Api = require('./api');
const MONGODB_URL = config.get('datasource.databaseUrl');

const corsOpt = {
  origin: '*',
  credentials: false,
  exposedHeaders: 'authorization',
  maxAge: 10 * 60,
};

app.use(cors());
app.use(express.json());
mongoose
  .connect(MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('Database Connected to Quick Rating App');
    rootLogger.info('Database Connected to Quick Rating App');
  })
  .catch((err) => console.log('connection error occurred:', err));

app.use('/api', Api);

const server = http.createServer(app).listen(process.env.PORT || 8081, function () {
  console.log('Http server listening on port', process.env.PORT || 8081);
  rootLogger.info('Http server listening on port', process.env.PORT || 8081);
});
app.use('/status', async (req, res) => {
  try {
    return res.status(200).json({
      message: 'Ok Working',
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.',
      error: error,
    });
  }
});
