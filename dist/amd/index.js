define(['exports', './aurelia-http-client-mock'], function (exports, _aureliaHttpClientMock) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.keys(_aureliaHttpClientMock).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _aureliaHttpClientMock[key];
      }
    });
  });
});