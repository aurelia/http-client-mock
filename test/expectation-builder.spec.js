import {ExpectationBuilder} from '../src/expectation-builder';

describe('A ExpectationBuilder builds an expectation which', () => {
  /** @type {ExpectationBuilder} */
  let builder;

  beforeEach(() => {
    let handler = {expect: () => {}};
    builder = new ExpectationBuilder(handler);
  });

  it('expects an url', () => {
    expect(builder.expectation.url).toBeFalsy();
    builder.withUrl('test');
    expect(builder.expectation.url).toBe('test');
  });

  it('expects a method', () => {
    expect(builder.expectation.method).toBeFalsy();
    builder.withMethod('PUT');
    expect(builder.expectation.method).toBe('PUT');
  });

  it('expects a body', () => {
    expect(builder.expectation.requestBody).toBeFalsy();
    builder.withRequestBody('some body');
    expect(builder.expectation.requestBody).toBe('some body');
  });

  it('expects some headers', () => {
    expect(builder.expectation.requestHeaders).toEqual({});
    builder.withRequestHeader('h1', 'v1');
    expect(builder.expectation.requestHeaders).toEqual({'h1': 'v1'});
    builder.withRequestHeader('h2', 'v2');
    expect(builder.expectation.requestHeaders).toEqual({'h1': 'v1', 'h2': 'v2'});
  });

  it('sends a code', () => {
    expect(builder.expectation.responseStatus).toBe(200);
    builder.withResponseStatus(412);
    expect(builder.expectation.responseStatus).toBe(412);
  });

  it('sends a body', () => {
    expect(builder.expectation.responseBody).toBeFalsy();
    builder.withResponseBody('some resp body');
    expect(builder.expectation.responseBody).toBe('some resp body');
  });

  it('sends a headers', () => {
    expect(builder.expectation.responseHeaders).toEqual({});
    builder.withResponseHeader('h1', 'v1');
    expect(builder.expectation.responseHeaders).toEqual({'h1': 'v1'});
    builder.withResponseHeader('h2', 'v2');
    expect(builder.expectation.responseHeaders).toEqual({'h1': 'v1', 'h2': 'v2'});
  });
});
