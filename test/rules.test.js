'use strict';

const mock = require('egg-mock');
const {assert} = require('egg-mock/bootstrap');

describe('test/rules.test.js', () => {
  let app;
  let ids = [];
  before(() => {
    app = mock.app({
      baseDir: 'apps/rules-test',
    });
    return app.ready();

  });

  beforeEach(async () => {
    let report = await app.model.Report.create({
      shift: 'AM',
      product: 'Wings',
      numberOfBoxes: 10,
      date: '2018-11-10',
      isReviewed: false,
      owner: '123',
      rootOnly: 'lol',
    });
    ids.push(report._id.toString());
    report = await app.model.Report.create({
      shift: 'PM',
      product: 'Salad',
      numberOfBoxes: 10,
      date: '2018-11-10',
      isReviewed: true,
      owner: '321',
      rootOnly: 'olo',
    });
    ids.push(report._id.toString());
  });

  after(async () => {
    app.close()
  });
  afterEach(async () => {
    await app.model.Report.findById(ids[0]).remove();
    await app.model.Report.findById(ids[1]).remove();
    ids = [];
    mock.restore();
  });

  it('root can read Report', async () => {
    let mw = app.middleware.accessControl({
      getRole: ctx => 'root',
      getUser: ctx => ({}),
      action: 'read',
      getId: ctx => ids[0],
      modelName: 'Report',
    });
    const ctx = app.mockContext({
      state: {}
    });
    await mw(ctx, () =>{});
    assert(ctx.status == 200)
  });

  it('root can update Report', async () => {
    let mw = app.middleware.accessControl({
      getRole: ctx => 'root',
      getUser: ctx => ({}),
      action: 'update',
      getRequestData: ctx => ({}),
      getId: ctx => ids[0],
      modelName: 'Report',
    });
    const ctx = app.mockContext({
      state: {},
      request: {
        method: 'PUT'
      }
    });
    ctx.request.method = 'PUT';
    await mw(ctx, () =>{});
    assert(ctx.status == 200)
  });

  it('root can create Report', async () => {
    let mw = app.middleware.accessControl({
      getRole: ctx => 'root',
      getUser: ctx => ({}),
      action: 'create',
      getRequestData: ctx => ({}),
      getId: ctx => ids[0],
      modelName: 'Report',
    });
    const ctx = app.mockContext({
      state: {},
      request: {
        method: 'PUT'
      }
    });
    ctx.request.method = 'POST';
    await mw(ctx, () =>{});
    assert(ctx.status == 200)
  });

  it('root can delete Report', async () => {
    let mw = app.middleware.accessControl({
      getRole: ctx => 'root',
      getUser: ctx => ({}),
      action: 'delete',
      getRequestData: ctx => ({}),
      getId: ctx => ids[0],
      modelName: 'Report',
    });
    const ctx = app.mockContext({
      state: {},
      request: {
        method: 'PUT'
      }
    });
    ctx.request.method = 'DELETE';
    await mw(ctx, () =>{});
    assert(ctx.status == 200)
  });

  it('supervisor can read Report', async () => {
    let mw = app.middleware.accessControl({
      getRole: ctx => 'supervisor',
      getUser: ctx => ({}),
      action: 'read',
      getId: ctx => ids[0],
      modelName: 'Report',
    });
    const ctx = app.mockContext({
      state: {}
    });
    await mw(ctx, () =>{});
    assert(ctx.status == 200)
  });

  it('supervisor can read reviewed Report', async () => {
    let mw = app.middleware.accessControl({
      getRole: ctx => 'supervisor',
      getUser: ctx => ({id: '123'}),
      action: 'read',
      getId: ctx => ids[1],
      modelName: 'Report',
    });
    const ctx = app.mockContext({
      state: {}
    });
    await mw(ctx, () =>{});
    assert(ctx.status == 200)
  });

  it('supervisor can update own Report', async () => {
    let mw = app.middleware.accessControl({
      getRole: ctx => 'supervisor',
      getUser: ctx => ({id: '123'}),
      action: 'update',
      getRequestData: ctx => ({}),
      getId: ctx => ids[0],
      modelName: 'Report',
    });
    const ctx = app.mockContext({
      state: {}
    });
    ctx.request.method = 'PUT';
    await mw(ctx, () =>{});
    assert(ctx.status == 200)
  });

  it('supervisor cannot update other\'s Report', async () => {
    let mw = app.middleware.accessControl({
      getRole: ctx => 'supervisor',
      getUser: ctx => ({id: '321'}),
      action: 'update',
      getRequestData: ctx => ({}),
      getId: ctx => ids[0],
      modelName: 'Report',
    });
    const ctx = app.mockContext({
      state: {}
    });
    ctx.request.method = 'PUT';
    await mw(ctx, () =>{});
    assert(ctx.status == 403)
  });

  it('supervisor can update isReviewed field', async () => {
    let mw = app.middleware.accessControl({
      getRole: ctx => 'supervisor',
      getUser: ctx => ({id: '123'}),
      action: 'update',
      getRequestData: ctx => ({
        isReviewed: false,
      }),
      getId: ctx => ids[0],
      modelName: 'Report',
    });
    const ctx = app.mockContext({
      state: {}
    });
    ctx.request.method = 'PUT';
    await mw(ctx, () =>{});
    assert(ctx.status == 403)
  });

  it('supervisor can update rootonly field', async () => {
    let mw = app.middleware.accessControl({
      getRole: ctx => 'supervisor',
      getUser: ctx => ({id: '123'}),
      action: 'update',
      getRequestData: ctx => ({rootOnly: 'abc'}),
      getId: ctx => ids[0],
      modelName: 'Report',
    });
    const ctx = app.mockContext({
      state: {}
    });
    ctx.request.method = 'PUT';
    await mw(ctx, () =>{});
    assert(ctx.status == 403)
  });

  it('supervisor can create Report', async () => {
    let mw = app.middleware.accessControl({
      getRole: ctx => 'supervisor',
      getUser: ctx => ({id: '123'}),
      action: 'create',
      getRequestData: ctx => ({}),
      modelName: 'Report',
    });
    const ctx = app.mockContext({
      state: {}
    });
    ctx.request.method = 'POST';
    await mw(ctx, () =>{});
    assert(ctx.status == 200)
  });

  it('supervisor cannot create with field isReviewed', async () => {
    let mw = app.middleware.accessControl({
      getRole: ctx => 'supervisor',
      getUser: ctx => ({id: '321'}),
      action: 'create',
      getRequestData: ctx => ({isReviewed: true}),
      modelName: 'Report',
    });
    const ctx = app.mockContext({
      state: {}
    });
    ctx.request.method = 'POST';
    await mw(ctx, () =>{});
    assert(ctx.status == 403)
  });

  it('supervisor cannot create with field rootOnly', async () => {
    let mw = app.middleware.accessControl({
      getRole: ctx => 'supervisor',
      getUser: ctx => ({id: '321'}),
      action: 'create',
      getRequestData: ctx => ({rootOnly: 'abc'}),
      modelName: 'Report',
    });
    const ctx = app.mockContext({
      state: {}
    });
    ctx.request.method = 'POST';
    await mw(ctx, () =>{});
    assert(ctx.status == 403)
  });

  it('supervisor cannot create with field owner', async () => {
    let mw = app.middleware.accessControl({
      getRole: ctx => 'supervisor',
      getUser: ctx => ({id: '321'}),
      action: 'create',
      getRequestData: ctx => ({owner: '123'}),
      modelName: 'Report',
    });
    const ctx = app.mockContext({
      state: {}
    });
    ctx.request.method = 'POST';
    await mw(ctx, () =>{});
    assert(ctx.status == 403)
  });

  it('supervisor can delete own report', async () => {
    let mw = app.middleware.accessControl({
      getRole: ctx => 'supervisor',
      getUser: ctx => ({id: '123'}),
      action: 'delete',
      getId: ctx => ids[0],
      modelName: 'Report',
    });
    const ctx = app.mockContext({
      state: {}
    });
    ctx.request.method = 'DELETE';
    await mw(ctx, () =>{});
    assert(ctx.status == 200)
  });

  it('supervisor can delete other\'s report', async () => {
    let mw = app.middleware.accessControl({
      getRole: ctx => 'supervisor',
      getUser: ctx => ({id: '321'}),
      action: 'delete',
      getId: ctx => ids[0],
      modelName: 'Report',
    });
    const ctx = app.mockContext({
      state: {}
    });
    ctx.request.method = 'DELETE';
    await mw(ctx, () =>{});
    assert(ctx.status == 403)
  });

  it('supervisor cannot delete reviewed report', async () => {
    let mw = app.middleware.accessControl({
      getRole: ctx => 'supervisor',
      getUser: ctx => ({id: '321'}),
      action: 'delete',
      getId: ctx => ids[1],
      modelName: 'Report',
    });
    const ctx = app.mockContext({
      state: {}
    });
    ctx.request.method = 'DELETE';
    await mw(ctx, () =>{});
    assert(ctx.status == 403)
  });
});
