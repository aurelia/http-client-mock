'use strict';

System.register(['aurelia-http-client', 'aurelia-dependency-injection'], function (_export, _context) {
  "use strict";

  var http, Container, _createClass, _class, _temp, XMLHttpRequestMock, RequestHandler, Expectation, ExpectationBuilder, HttpClientMock;

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  

  return {
    setters: [function (_aureliaHttpClient) {
      http = _aureliaHttpClient;
    }, function (_aureliaDependencyInjection) {
      Container = _aureliaDependencyInjection.Container;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _export('XMLHttpRequestMock', XMLHttpRequestMock = (_temp = _class = function () {
        function XMLHttpRequestMock() {
          

          this.url = '';
          this.method = '';
          this.readyState = XMLHttpRequestMock.UNSENT;
          this.status = 0;
          this.requestText = '';
          this.responseText = '';
          this.requestHeaders = {};
          this.responseHeaders = {};
          this.timeout = 0;
          this._listeners = {};
        }

        XMLHttpRequestMock.prototype.open = function open(method, url) {
          this.method = method.toUpperCase();
          this.url = url;

          this.readyState = XMLHttpRequestMock.OPENED;
          this.dispatchEvent('readystatechange');
        };

        XMLHttpRequestMock.prototype.send = function send(data) {
          var _this = this;

          if (this.readyState < XMLHttpRequestMock.OPENED) {
            throw new Error('Connection not yet open');
          }

          this.requestText = data;

          this.readyState = XMLHttpRequestMock.LOADING;
          this.dispatchEvent('readystatechange');
          this.dispatchEvent('sent');

          if (this.timeout) {
            setTimeout(function () {
              return _this.dispatchEvent('timeout');
            }, this.timeout);
          }
        };

        XMLHttpRequestMock.prototype.receive = function receive(status, headers, content) {
          this.status = status;
          this.responseHeaders = headers;
          this.readyState = XMLHttpRequestMock.HEADERS_RECEIVED;
          this.dispatchEvent('readystatechange');

          this.responseText = content;
          this.readyState = XMLHttpRequestMock.DONE;
          this.dispatchEvent('readystatechange');
          this.dispatchEvent('progress');
          this.dispatchEvent('load');
        };

        XMLHttpRequestMock.prototype.setRequestHeader = function setRequestHeader(name, value) {
          this.requestHeaders[name.toLocaleLowerCase()] = value;
        };

        XMLHttpRequestMock.prototype.getAllResponseHeaders = function getAllResponseHeaders() {
          var headerStr = '';
          for (var header in this.responseHeaders) {
            headerStr += header + ': ' + this.responseHeaders[header] + '\r\n';
          }
          return headerStr;
        };

        XMLHttpRequestMock.prototype.addEventListener = function addEventListener(event, callback) {
          this._listeners[event] = this._listeners[event] || [];
          this._listeners[event].push(callback);
        };

        XMLHttpRequestMock.prototype.dispatchEvent = function dispatchEvent(event) {
          if (Array.isArray(this._listeners[event])) {
            for (var i = 0; i < this._listeners[event].length; i++) {
              this._listeners[event][i].call(this);
            }
          }
        };

        _createClass(XMLHttpRequestMock, [{
          key: 'onreadystatechange',
          set: function set(fn) {
            this.addEventListener('readystatechange', fn);
          }
        }, {
          key: 'onload',
          set: function set(fn) {
            this.addEventListener('load', fn);
          }
        }, {
          key: 'ontimeout',
          set: function set(fn) {
            this.addEventListener('timeout', fn);
          }
        }, {
          key: 'onerror',
          set: function set(fn) {
            this.addEventListener('error', fn);
          }
        }, {
          key: 'onabort',
          set: function set(fn) {
            this.addEventListener('abort', fn);
          }
        }]);

        return XMLHttpRequestMock;
      }(), _class.UNSENT = 0, _class.OPENED = 1, _class.HEADERS_RECEIVED = 2, _class.LOADING = 3, _class.DONE = 4, _temp));

      _export('XMLHttpRequestMock', XMLHttpRequestMock);

      _export('RequestHandler', RequestHandler = function () {
        function RequestHandler() {
          

          this.expected = [];
          this.unexpected = [];
        }

        RequestHandler.prototype.expect = function expect(expected) {
          this.expected.push(expected);
        };

        RequestHandler.prototype.handle = function handle(xhr) {
          for (var i = this.expected.length; i--;) {
            var expected = this.expected[i];

            if (expected.matches(xhr)) {
              xhr.receive(expected.responseStatus, expected.responseHeaders, expected.responseBody);

              this.expected.splice(i, 1);
              return;
            }
          }

          this.unexpected.push(xhr);
        };

        RequestHandler.prototype.isDone = function isDone() {
          return !this.expected.length;
        };

        RequestHandler.prototype.hadUnexpected = function hadUnexpected() {
          return !!this.unexpected.length;
        };

        return RequestHandler;
      }());

      _export('RequestHandler', RequestHandler);

      _export('Expectation', Expectation = function () {
        function Expectation() {
          

          this.url = null;
          this.method = null;
          this.requestHeaders = {};
          this.requestBody = null;
          this.responseStatus = 200;
          this.responseHeaders = {};
          this.responseBody = '';
        }

        Expectation.prototype.matches = function matches(xhr) {
          if (this.url && xhr.url !== this.url) {
            return false;
          }
          if (this.method && xhr.method !== this.method) {
            return false;
          }
          if (!this._compareObjects(this.requestHeaders, xhr.requestHeaders)) {
            return false;
          }

          return !(this.requestBody && xhr.requestText !== this.requestBody);
        };

        Expectation.prototype._compareObjects = function _compareObjects(object1, object2) {
          if (Object.keys(object1).length) {
            for (var key in object1) {
              if (!object1.hasOwnProperty(key)) {
                continue;
              }
              if (!object2[key] || object2[key] !== object1[key]) {
                return false;
              }
            }
          }
          return true;
        };

        return Expectation;
      }());

      _export('Expectation', Expectation);

      _export('ExpectationBuilder', ExpectationBuilder = function () {
        function ExpectationBuilder(handler) {
          

          this.expectation = null;

          this.expectation = new Expectation();

          handler.expect(this.expectation);
        }

        ExpectationBuilder.prototype.withUrl = function withUrl(url) {
          this.expectation.url = url;
          return this;
        };

        ExpectationBuilder.prototype.withMethod = function withMethod(method) {
          this.expectation.method = method;
          return this;
        };

        ExpectationBuilder.prototype.withRequestHeader = function withRequestHeader(name, value) {
          this.expectation.requestHeaders[name.toLocaleLowerCase()] = value;
          return this;
        };

        ExpectationBuilder.prototype.withRequestBody = function withRequestBody(body) {
          this.expectation.requestBody = typeof body === 'string' ? body : JSON.stringify(body);
          return this;
        };

        ExpectationBuilder.prototype.withResponseStatus = function withResponseStatus(status) {
          this.expectation.responseStatus = status;
          return this;
        };

        ExpectationBuilder.prototype.withResponseHeader = function withResponseHeader(name, value) {
          this.expectation.responseHeaders[name.toLocaleLowerCase()] = value;
          return this;
        };

        ExpectationBuilder.prototype.withResponseBody = function withResponseBody(body) {
          this.expectation.responseBody = typeof body === 'string' ? body : JSON.stringify(body);
          return this;
        };

        return ExpectationBuilder;
      }());

      _export('ExpectationBuilder', ExpectationBuilder);

      _export('HttpClientMock', HttpClientMock = function (_http$HttpClient) {
        _inherits(HttpClientMock, _http$HttpClient);

        function HttpClientMock() {
          

          var _this2 = _possibleConstructorReturn(this, _http$HttpClient.call(this));

          var handler = _this2.handler = new RequestHandler();

          var XHR = function (_XMLHttpRequestMock) {
            _inherits(XHR, _XMLHttpRequestMock);

            function XHR() {
              

              var _this3 = _possibleConstructorReturn(this, _XMLHttpRequestMock.call(this));

              _this3.addEventListener('sent', function () {
                handler.handle(_this3);
              });
              return _this3;
            }

            return XHR;
          }(XMLHttpRequestMock);

          _this2.requestProcessorFactories = new Map();
          _this2.requestProcessorFactories.set(http.HttpRequestMessage, function () {
            return HttpClientMock.createMockProcessor(XHR);
          });
          _this2.requestProcessorFactories.set(http.JSONPRequestMessage, function () {
            return HttpClientMock.createMockProcessor(XHR);
          });
          return _this2;
        }

        HttpClientMock.createMockProcessor = function createMockProcessor(xhr) {
          return new http.RequestMessageProcessor(xhr, [http.timeoutTransformer, http.credentialsTransformer, http.progressTransformer, http.responseTypeTransformer, http.headerTransformer, http.contentTransformer]);
        };

        HttpClientMock.prototype.registerGlobally = function registerGlobally() {
          new Container().makeGlobal();
          Container.instance.registerInstance(http.HttpClient, this);
        };

        HttpClientMock.prototype.expect = function expect(url) {
          return new ExpectationBuilder(this.handler).withUrl(url);
        };

        HttpClientMock.prototype.isDone = function isDone() {
          return this.handler.isDone();
        };

        HttpClientMock.prototype.getExpected = function getExpected() {
          return this.handler.expected;
        };

        HttpClientMock.prototype.hadUnexpected = function hadUnexpected() {
          return this.handler.hadUnexpected();
        };

        HttpClientMock.prototype.getUnexpected = function getUnexpected() {
          return this.handler.unexpected;
        };

        return HttpClientMock;
      }(http.HttpClient));

      _export('HttpClientMock', HttpClientMock);
    }
  };
});