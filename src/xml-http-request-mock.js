export class XMLHttpRequestMock {

  static UNSENT = 0;
  static OPENED = 1;
  static HEADERS_RECEIVED = 2;
  static LOADING = 3;
  static DONE = 4;

  readyState = XMLHttpRequestMock.UNSENT;
  status = 0;
  requestText = '';
  responseText = '';
  requestHeaders = {};
  responseHeaders = {};
  timeout = 0;
  _listeners = {};

  open(method: string, url: string, isAsync: Boolean) {
    this.method = method.toUpperCase();
    this.url = url;
    this.isAsync = isAsync || true;

    this.readyState = XMLHttpRequestMock.OPENED;
    this.dispatchEvent('readystatechange');
  }

  send(data: any) {
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

  receive(status: number, headers: Object, content: string) {
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

  setRequestHeader(name: string, value: string) {
    this.requestHeaders[name.toLocaleLowerCase()] = value;
  }

  getAllResponseHeaders() {
    let headerStr = '';
    for (let header in this.responseHeaders) {
      headerStr += `${header}: ${this.responseHeaders[header]}\r\n`;
    }
    return headerStr;
  }

  addEventListener(event: string, fn: Function) {
    this._listeners[event] = this._listeners[event] || [];
    this._listeners[event].push(fn);
  }

  dispatchEvent(event: string, data: any) {
    if (Array.isArray(this._listeners[event])) {
      for (let i = 0; i < this._listeners[event].length; i++) {
        this._listeners[event][i].apply(this, data);
      }
    }
  }

  set onreadystatechange(fn: Function) {
    this.addEventListener('readystatechange', fn);
  }

  set onload(fn: Function) {
    this.addEventListener('load', fn);
  }

  set ontimeout(fn: Function) {
    this.addEventListener('timeout', fn);
  }

  set onerror(fn: Function) {
    this.addEventListener('error', fn);
  }

  set onabort(fn: Function) {
    this.addEventListener('abort', fn);
  }
}
