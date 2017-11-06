var _class, _temp;

import * as http from 'aurelia-http-client';
import { Container } from 'aurelia-dependency-injection';

export let XMLHttpRequestMock = (_temp = _class = class XMLHttpRequestMock {
  constructor() {
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

  open(method, url) {
    this.method = method.toUpperCase();
    this.url = url;

    this.readyState = XMLHttpRequestMock.OPENED;
    this.dispatchEvent('readystatechange');
  }

  send(data) {
    if (this.readyState < XMLHttpRequestMock.OPENED) {
      throw new Error('Connection not yet open');
    }

    this.requestText = data;

    this.readyState = XMLHttpRequestMock.LOADING;
    this.dispatchEvent('readystatechange');
    this.dispatchEvent('sent');

    if (this.timeout) {
      setTimeout(() => this.dispatchEvent('timeout'), this.timeout);
    }
  }

  receive(status, headers, content) {
    this.status = status;
    this.responseHeaders = headers;
    this.readyState = XMLHttpRequestMock.HEADERS_RECEIVED;
    this.dispatchEvent('readystatechange');

    this.responseText = content;
    this.readyState = XMLHttpRequestMock.DONE;
    this.dispatchEvent('readystatechange');
    this.dispatchEvent('progress');
    this.dispatchEvent('load');
  }

  setRequestHeader(name, value) {
    this.requestHeaders[name.toLocaleLowerCase()] = value;
  }

  getAllResponseHeaders() {
    let headerStr = '';
    for (let header in this.responseHeaders) {
      headerStr += `${header}: ${this.responseHeaders[header]}\r\n`;
    }
    return headerStr;
  }

  addEventListener(event, callback) {
    this._listeners[event] = this._listeners[event] || [];
    this._listeners[event].push(callback);
  }

  dispatchEvent(event) {
    if (Array.isArray(this._listeners[event])) {
      for (let i = 0; i < this._listeners[event].length; i++) {
        this._listeners[event][i].call(this);
      }
    }
  }

  set onreadystatechange(fn) {
    this.addEventListener('readystatechange', fn);
  }

  set onload(fn) {
    this.addEventListener('load', fn);
  }

  set ontimeout(fn) {
    this.addEventListener('timeout', fn);
  }

  set onerror(fn) {
    this.addEventListener('error', fn);
  }

  set onabort(fn) {
    this.addEventListener('abort', fn);
  }
}, _class.UNSENT = 0, _class.OPENED = 1, _class.HEADERS_RECEIVED = 2, _class.LOADING = 3, _class.DONE = 4, _temp);

export let RequestHandler = class RequestHandler {
  constructor() {
    this.expected = [];
    this.unexpected = [];
  }

  expect(expected) {
    this.expected.push(expected);
  }

  handle(xhr) {
    for (let i = this.expected.length; i--;) {
      let expected = this.expected[i];

      if (expected.matches(xhr)) {
        xhr.receive(expected.responseStatus, expected.responseHeaders, expected.responseBody);

        this.expected.splice(i, 1);
        return;
      }
    }

    this.unexpected.push(xhr);
  }

  isDone() {
    return !this.expected.length;
  }

  hadUnexpected() {
    return !!this.unexpected.length;
  }
};

export let Expectation = class Expectation {
  constructor() {
    this.url = null;
    this.method = null;
    this.requestHeaders = {};
    this.requestBody = null;
    this.responseStatus = 200;
    this.responseHeaders = {};
    this.responseBody = '';
  }

  matches(xhr) {
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
  }

  _compareObjects(object1, object2) {
    if (Object.keys(object1).length) {
      for (let key in object1) {
        if (!object1.hasOwnProperty(key)) {
          continue;
        }
        if (!object2[key] || object2[key] !== object1[key]) {
          return false;
        }
      }
    }
    return true;
  }
};

export let ExpectationBuilder = class ExpectationBuilder {
  constructor(handler) {
    this.expectation = null;

    this.expectation = new Expectation();

    handler.expect(this.expectation);
  }

  withUrl(url) {
    this.expectation.url = url;
    return this;
  }

  withMethod(method) {
    this.expectation.method = method;
    return this;
  }

  withRequestHeader(name, value) {
    this.expectation.requestHeaders[name.toLocaleLowerCase()] = value;
    return this;
  }

  withRequestBody(body) {
    this.expectation.requestBody = typeof body === 'string' ? body : JSON.stringify(body);
    return this;
  }

  withResponseStatus(status) {
    this.expectation.responseStatus = status;
    return this;
  }

  withResponseHeader(name, value) {
    this.expectation.responseHeaders[name.toLocaleLowerCase()] = value;
    return this;
  }

  withResponseBody(body) {
    this.expectation.responseBody = typeof body === 'string' ? body : JSON.stringify(body);
    return this;
  }
};

export let HttpClientMock = class HttpClientMock extends http.HttpClient {
  constructor() {
    super();

    let handler = this.handler = new RequestHandler();
    let XHR = class XHR extends XMLHttpRequestMock {
      constructor() {
        super();
        this.addEventListener('sent', () => {
          handler.handle(this);
        });
      }
    };

    this.requestProcessorFactories = new Map();
    this.requestProcessorFactories.set(http.HttpRequestMessage, () => HttpClientMock.createMockProcessor(XHR));
    this.requestProcessorFactories.set(http.JSONPRequestMessage, () => HttpClientMock.createMockProcessor(XHR));
  }

  static createMockProcessor(xhr) {
    return new http.RequestMessageProcessor(xhr, [http.timeoutTransformer, http.credentialsTransformer, http.progressTransformer, http.responseTypeTransformer, http.headerTransformer, http.contentTransformer]);
  }

  registerGlobally() {
    new Container().makeGlobal();
    Container.instance.registerInstance(http.HttpClient, this);
  }

  expect(url) {
    return new ExpectationBuilder(this.handler).withUrl(url);
  }

  isDone() {
    return this.handler.isDone();
  }

  getExpected() {
    return this.handler.expected;
  }

  hadUnexpected() {
    return this.handler.hadUnexpected();
  }

  getUnexpected() {
    return this.handler.unexpected;
  }
};