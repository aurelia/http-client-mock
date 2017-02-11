import {Expectation} from '../src/expectation';

describe('A Expectation', () => {
  /** @type {XMLHttpRequestMock} */
  let xhr;
  /** @type {Expectation} */
  let expectation;

  beforeEach(() => {
    expectation = new Expectation();
    xhr = {
      url: null,
      method: 'GET',
      requestHeaders: {},
      requestText: null
    };
  });

  it('matches url', () => {
    expectation.url = 'asd';
    xhr.url = 'asd';
    expect(expectation.matches(xhr)).toBeTruthy();

    xhr.url = null;
    expect(expectation.matches(xhr)).toBeFalsy();
  });

  it('matches method', () => {
    expectation.method = 'PUT';
    xhr.method = 'PUT';
    expect(expectation.matches(xhr)).toBeTruthy();

    xhr.method = 'GET';
    expect(expectation.matches(xhr)).toBeFalsy();
  });

  it('matches body', () => {
    expectation.requestBody = 'some content';
    xhr.requestText = 'some content';
    expect(expectation.matches(xhr)).toBeTruthy();

    xhr.requestText = 'some other content';
    expect(expectation.matches(xhr)).toBeFalsy();
  });

  it('matches headers', () => {
    expectation.requestHeaders = {'one': 'value', 'two': 'other value'};
    xhr.requestHeaders = {'one': 'value', 'two': 'other value'};
    expect(expectation.matches(xhr)).toBeTruthy();

    xhr.requestHeaders = {'one': 'value', 'two': 'asd'};
    expect(expectation.matches(xhr)).toBeFalsy();

    xhr.requestHeaders = {'one': 'value'};
    expect(expectation.matches(xhr)).toBeFalsy();
  });
});
