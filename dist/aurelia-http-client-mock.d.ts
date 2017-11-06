import * as http from 'aurelia-http-client';
export declare class XMLHttpRequestMock {
    static UNSENT: number;
    static OPENED: number;
    static HEADERS_RECEIVED: number;
    static LOADING: number;
    static DONE: number;
    url: string;
    method: string;
    readyState: number;
    status: number;
    requestText: string;
    responseText: string;
    requestHeaders: {};
    responseHeaders: {};
    timeout: number;
    _listeners: {};
    /**
     * @param method {String}
     * @param url {String}
     */
    open(method: any, url: any): void;
    /**
     * @param data {String}
     */
    send(data: any): void;
    /**
     * @param status {Number}
     * @param headers {Object}
     * @param content {String}
     */
    receive(status: any, headers: any, content: any): void;
    /**
     * @param name {String}
     * @param value {String}
     */
    setRequestHeader(name: any, value: any): void;
    /**
     * @returns {String}
     */
    getAllResponseHeaders(): string;
    /**
     * @param event {String}
     * @param callback {Function}
     */
    addEventListener(event: any, callback: any): void;
    /**
     * @param event {String}
     */
    dispatchEvent(event: any): void;
    /**
     * @param fn {Function}
     */
    onreadystatechange: any;
    /**
     * @param fn {Function}
     */
    onload: any;
    /**
     * @param fn {Function}
     */
    ontimeout: any;
    /**
     * @param fn {Function}
     */
    onerror: any;
    /**
     * @param fn {Function}
     */
    onabort: any;
}
export declare class RequestHandler {
    /**
     * @type {Array<Expectation>}
     */
    expected: any[];
    /**
     * @type {Array<XMLHttpRequestMock>}
     */
    unexpected: any[];
    /**
     * @param expected {Expectation}
     */
    expect(expected: any): void;
    /**
     * @param xhr {XMLHttpRequestMock}
     */
    handle(xhr: any): void;
    /**
     * @returns {Boolean}
     */
    isDone(): boolean;
    /**
     * @returns {Boolean}
     */
    hadUnexpected(): boolean;
}
export declare class Expectation {
    url: any;
    method: any;
    requestHeaders: {};
    requestBody: any;
    responseStatus: number;
    responseHeaders: {};
    responseBody: string;
    /**
     * @param xhr {XMLHttpRequestMock}
     * @returns {Boolean}
     */
    matches(xhr: any): boolean;
    /**
     * @param object1 {Object}
     * @param object2 {Object}
     * @returns {Boolean}
     * @private
     */
    _compareObjects(object1: any, object2: any): boolean;
}
export declare class ExpectationBuilder {
    expectation: any;
    /**
     * @param handler {RequestHandler}
     */
    constructor(handler: any);
    /**
     * Expect an url to be called
     * @param url {String}
     * @returns {ExpectationBuilder}
     */
    withUrl(url: any): this;
    /**
     * Expect the request to be done with a specific method
     * @param method {String}
     * @returns {ExpectationBuilder}
     */
    withMethod(method: any): this;
    /**
     * Expect the request to contain certain header
     * @param name {String}
     * @param value {String}
     * @returns {ExpectationBuilder}
     */
    withRequestHeader(name: any, value: any): this;
    /**
     * Expect the request to send specific data
     * @param body {String}
     * @returns {ExpectationBuilder}
     */
    withRequestBody(body: any): this;
    /**
     * Expect the request to respond with specific http status code
     * @param status {Number}
     * @returns {ExpectationBuilder}
     */
    withResponseStatus(status: any): this;
    /**
     * Expect the response to contain a certain header
     * @param name {String}
     * @param value {String}
     * @returns {ExpectationBuilder}
     */
    withResponseHeader(name: any, value: any): this;
    /**
     * Expect the response to contain specific data
     * @param body {String|Object}
     * @returns {ExpectationBuilder}
     */
    withResponseBody(body: any): this;
}
export declare class HttpClientMock extends http.HttpClient {
    handler: RequestHandler;
    requestProcessorFactories: Map<Object, Function>;
    /**
     * @constructor
     */
    constructor();
    /**
     * @param xhr {XMLHttpRequestMock}
     * @returns {http.RequestMessageProcessor}
     */
    static createMockProcessor(xhr: any): http.RequestMessageProcessor;
    /**
     * @void
     */
    registerGlobally(): void;
    /**
     * @param url {String}
     * @returns {ExpectationBuilder}
     */
    expect(url: any): ExpectationBuilder;
    /**
     * @returns {Boolean}
     */
    isDone(): boolean;
    /**
     * @returns {Array<Expectation>}
     */
    getExpected(): any[];
    /**
     * @returns {Boolean}
     */
    hadUnexpected(): boolean;
    /**
     * @returns {Array<XMLHttpRequestMock>}
     */
    getUnexpected(): any[];
}
