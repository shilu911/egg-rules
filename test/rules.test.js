'use strict';

const mock = require('egg-mock');

describe('test/rules.test.js', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/rules-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should GET /', () => {
    return app.httpRequest()
      .get('/')
      .expect('hi, rules')
      .expect(200);
  });
});
