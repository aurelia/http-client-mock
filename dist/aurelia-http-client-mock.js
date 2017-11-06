import * as http from 'aurelia-http-client';
import {Container} from 'aurelia-dependency-injection';

export class XMLHttpRequestMock {

  static UNSENT = 0;
  static OPENED = 1;
  static HEADERS_RECEIVED = 2;
  static LOADING = 3;
  static DONE = 4;

  url = '';
  method = '';
  readyState = XMLHttpRequestMock.UNSENT;
  status = 0;
  requestText = '';
  responseText = '';
  requestHeaders = {};
  responseHeaders = {};
  timeout = 0;
  _listeners = {};

  /**
   * @param method {String}
   * @param url {String}
   */
  open(method, url) {
    this.method = method.toUpperCase();
    this.url = url;

    this.readyState = XMLHttpRequestMock.OPENED;
    this.dispatchEvent('readystatechange');
  }

  /**
   * @param data {String}
   */
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

  /**
   * @param status {Number}
   * @param headers {Object}
   * @param content {String}
   */
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

  /**
   * @param name {String}
   * @param value {String}
   */
  setRequestHeader(name, value) {
    this.requestHeaders[name.toLocaleLowerCase()] = value;
  }

  /**
   * @returns {String}
   */
  getAllResponseHeaders() {
    let headerStr = '';
    for (let header in this.responseHeaders) {
      headerStr += `${header}: ${this.responseHeaders[header]}\r\n`;
    }
    return headerStr;
  }

  /**
   * @param event {String}
   * @param callback {Function}
   */
  addEventListener(event, callback) {
    this._listeners[event] = this._listeners[event] || [];
    this._listeners[event].push(callback);
  }

  /**
   * @param event {String}
   */
  dispatchEvent(event) {
    if (Array.isArray(this._listeners[event])) {
      for (let i = 0; i < this._listeners[event].length; i++) {
        this._listeners[event][i].call(this);
      }
    }
  }

  /**
   * @param fn {Function}
   */
  set onreadystatechange(fn) {
    this.addEventListener('readystatechange', fn);
  }

  /**
   * @param fn {Function}
   */
  set onload(fn) {
    this.addEventListener('load', fn);
  }

  /**
   * @param fn {Function}
   */
  set ontimeout(fn) {
    this.addEventListener('timeout', fn);
  }

  /**
   * @param fn {Function}
   */
  set onerror(fn) {
    this.addEventListener('error', fn);
  }

  /**
   * @param fn {Function}
   */
  set onabort(fn) {
    this.addEventListener('abort', fn);
  }
}


export class RequestHandler {

  /**
   * @type {Array<Expectation>}
   */
  expected = [];

  /**
   * @type {Array<XMLHttpRequestMock>}
   */
  unexpected = [];

  /**
   * @param expected {Expectation}
   */
  expect(expected) {
    this.expected.push(expected);
  }

  /**
   * @param xhr {XMLHttpRequestMock}
   */
  handle(xhr) {
    for (let i = this.expected.length; i--;) {
      let expected = this.expected[i];
      // Compare url and http method
      if (expected.matches(xhr)) {
        // Emulate response with expected values
        xhr.receive(expected.responseStatus, expected.responseHeaders, expected.responseBody);
        // Remove the expected request because we handle it only once
        this.expected.splice(i, 1);
        return;
      }
    }
    // No expected request was found if the function hasn't returned yet
    this.unexpected.push(xhr);
  }

  /**
   * @returns {Boolean}
   */
  isDone() {
    return !this.expected.length;
  }

  /**
   * @returns {Boolean}
   */
  hadUnexpected() {
    return !!this.unexpected.length;
  }
}


export class Expectation {

  url = null;

  method = null;

  requestHeaders = {};

  requestBody = null;

  responseStatus = 200;

  responseHeaders = {};

  responseBody = '';

  /**
   * @param xhr {XMLHttpRequestMock}
   * @returns {Boolean}
   */
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

  /**
   * @param object1 {Object}
   * @param object2 {Object}
   * @returns {Boolean}
   * @private
   */
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
}

export class ExpectationBuilder {

  expectation = null;

  /**
   * @param handler {RequestHandler}
   */
  constructor(handler) {
    this.expectation = new Expectation();
    // Set reference to handler
    handler.expect(this.expectation);
  }

  /**
   * Expect an url to be called
   * @param url {String}
   * @returns {ExpectationBuilder}
   */
  withUrl(url) {
    this.expectation.url = url;
    return this;
  }

  /**
   * Expect the request to be done with a specific method
   * @param method {String}
   * @returns {ExpectationBuilder}
   */
  withMethod(method) {
    this.expectation.method = method;
    return this;
  }

  /**
   * Expect the request to contain certain header
   * @param name {String}
   * @param value {String}
   * @returns {ExpectationBuilder}
   */
  withRequestHeader(name, value) {
    this.expectation.requestHeaders[name.toLocaleLowerCase()] = value;
    return this;
  }

  /**
   * Expect the request to send specific data
   * @param body {String}
   * @returns {ExpectationBuilder}
   */
  withRequestBody(body) {
    this.expectation.requestBody = typeof body === 'string' ? body : JSON.stringify(body);
    return this;
  }

  /**
   * Expect the request to respond with specific http status code
   * @param status {Number}
   * @returns {ExpectationBuilder}
   */
  withResponseStatus(status) {
    this.expectation.responseStatus = status;
    return this;
  }

  /**
   * Expect the response to contain a certain header
   * @param name {String}
   * @param value {String}
   * @returns {ExpectationBuilder}
   */
  withResponseHeader(name, value) {
    this.expectation.responseHeaders[name.toLocaleLowerCase()] = value;
    return this;
  }

  /**
   * Expect the response to contain specific data
   * @param body {String|Object}
   * @returns {ExpectationBuilder}
   */
  withResponseBody(body) {
    this.expectation.responseBody = typeof body === 'string' ? body : JSON.stringify(body);
    return this;
  }
}

export class HttpClientMock extends http.HttpClient {

  handler:RequestHandler;
  requestProcessorFactories:Map<Object, Function>;

  /**
   * @constructor
   */
  constructor() {
    super();

    let handler = this.handler = new RequestHandler();
    // Ensure each http client has it's own xhr mock instance with it's own handler
    class XHR extends XMLHttpRequestMock {
      constructor() {
        super();
        this.addEventListener('sent', () => {
          handler.handle(this);
        });
      }
    }
    // Create message processor with xhr mock
    this.requestProcessorFactories = new Map();
    this.requestProcessorFactories.set(http.HttpRequestMessage, () => HttpClientMock.createMockProcessor(XHR));
    this.requestProcessorFactories.set(http.JSONPRequestMessage, () => HttpClientMock.createMockProcessor(XHR));
  }

  /**
   * @param xhr {XMLHttpRequestMock}
   * @returns {http.RequestMessageProcessor}
   */
  static createMockProcessor(xhr) {
    return new http.RequestMessageProcessor(xhr, [
      http.timeoutTransformer,
      http.credentialsTransformer,
      http.progressTransformer,
      http.responseTypeTransformer,
      http.headerTransformer,
      http.contentTransformer
    ]);
  }

  /**
   * @void
   */
  registerGlobally() {
    new Container().makeGlobal();
    Container.instance.registerInstance(http.HttpClient, this);
  }

  /**
   * @param url {String}
   * @returns {ExpectationBuilder}
   */
  expect(url) {
    return new ExpectationBuilder(this.handler).withUrl(url);
  }

  /**
   * @returns {Boolean}
   */
  isDone() {
    return this.handler.isDone();
  }

  /**
   * @returns {Array<Expectation>}
   */
  getExpected() {
    return this.handler.expected;
  }

  /**
   * @returns {Boolean}
   */
  hadUnexpected() {
    return this.handler.hadUnexpected();
  }

  /**
   * @returns {Array<XMLHttpRequestMock>}
   */
  getUnexpected() {
    return this.handler.unexpected;
  }
}
