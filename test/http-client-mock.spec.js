import {HttpClientMock} from '../src/http-client-mock';

describe('A HttpClientMock', () => {
  /** @type {HttpClientMock} */
  let http;

  beforeEach(() => {
    http = new HttpClientMock();
  });

  it('returns the expected data', done => {
    http.expect('/some/url')
      .withMethod('POST')
      .withResponseStatus(201)
      .withResponseHeader('Location', 'test2')
      .withResponseBody('test');

    http.post('/some/url', null).then(response => {
      expect(response.statusCode).toBe(201);
      expect(response.response).toBe('test');
      expect(response.headers.get('Location')).toBe('test2');
      done();
    });
  });

  it('returns no data for unexpected calls', done => {
    http.expect('/some/basic/url')
      .withMethod('GET');

    http.configure(builder => {
      builder.withTimeout(1);
    });

    http.get('/some/basic/url')
      .then(done)
      .catch(() => {
        expect(true).toBeFalsy('Didn\'t got data');
        done();
      });

    http.get('/some/wrong/url')
      .then(() => {
        expect(true).toBeFalsy('Got data for unexpected call');
        done();
      })
      .catch(done);
  });

  it('returns data only for exact matches', done => {
    http.expect('/some/other/url')
      .withMethod('PUT')
      .withRequestHeader('Authorization', 'asd')
      .withRequestBody('qwerty')
      .withResponseStatus(201);

    let throwError = () => {
      expect(true).toBeFalsy('Unexpected request was fulfilled');
      done();
    };
    http.createRequest('/some/other/url').asPut().send().then(throwError);
    http.createRequest('/some/other/url').asPut().withHeader('Authorization', 'asd').send().then(throwError);
    http.createRequest('/some/other/url').asPut().withContent('qwerty').send().then(throwError);

    http.createRequest('/some/other/url')
      .asPut()
      .withHeader('Authorization', 'asd')
      .withContent('qwerty')
      .send()
      .then(done);
  });
});
