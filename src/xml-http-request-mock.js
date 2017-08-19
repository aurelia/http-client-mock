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
