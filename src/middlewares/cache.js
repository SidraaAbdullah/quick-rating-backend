'use strict';

var express = require('express');
var app = express();
var mcache = require('memory-cache');

exports.cache = (duration) => {
  return (req, res, next) => {
    if (!req.query.search) {
      let key = '__express__' + req.originalUrl || req.url;

      let cachedBody = mcache.get(key);
      if (cachedBody) {
        res.send(JSON.parse(cachedBody));
        return;
      } else {
        res.sendResponse = res.send;
        res.send = (body) => {
          mcache.put(key, body, duration * 1000);
          res.sendResponse(body);
        };
        next();
      }
    } else {
      next();
    }
  };
};
