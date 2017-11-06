'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _aureliaHttpClientMock = require('./aurelia-http-client-mock');

Object.keys(_aureliaHttpClientMock).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _aureliaHttpClientMock[key];
    }
  });
});