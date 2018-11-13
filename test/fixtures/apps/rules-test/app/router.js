'use strict';

/**
 *
 * @param options
 * getRole: function, take ctx as the first parameter, if is not set, then take ctx.state.me.role for default
 * getUser: function, take ctx as the first parameter, if is not set, then take ctx.state.me for default
 * getRequestData: function, take ctx as the first parameter, if is not set, then take body for default
 * action: create, read, update, delete and list
 * getId: function, take ctx as the first parameter, if is not set, then take id field ( from query string if is GET, otherwise from body) for default
 * modelName
 */


const getRole = ctx => 'supervisor';
const getUser = ctx => ({});

module.exports = app => {
  const { router, controller } = app;

  router.get('/', controller.home.index);
  router.get('/:id', app.middleware.accessControl({
    getRole,
    getUser,
    action: 'read',
    getId: ctx => ctx.params.id,
    modelName: 'Report',
  }), controller.home.index);
};
