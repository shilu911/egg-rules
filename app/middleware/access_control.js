'use strict';

const permittedFieldsOf = require('@casl/ability/extra').permittedFieldsOf;

const actionMappings = {
  GET: 'read',
  POST: 'create',
  PUT: 'update',
  PATCH: 'update',
  DELETE: 'delete',
};

/**
 *
 * @param ctx
 * @param modelName
 * @param id
 * @param ability
 * @return Boolean
 */
async function canRead(ctx, modelName, id, ability) {
  let entity = await ctx.model[modelName].findById(id);
  if (!entity) return true;
  return ability.can('read', entity);
}

/**
 *
 * @param ctx
 * @param modelName
 * @param id
 * @param requestData
 * @param ability
 * @return Boolean
 */
//TODO: make requestData support array as well
async function canUpdate(ctx, modelName, id, requestData, ability) {
  // check field
  let fields = Object.keys(requestData);
  for (let i = 0; i < fields.length; i++) {
    let field = fields[i];
    if (!ability.can('update', modelName, field)) {
      return false;
    }
  }
  let entity = await ctx.model[modelName].findById(id);
  return ability.can('update', entity);
}

/**
 *
 * @param ctx
 * @param modelName
 * @param requestData
 * @param ability
 * @return Boolean
 */
async function canCreate(ctx, modelName, requestData, ability) {
  // check field
  let fields = Object.keys(requestData);
  for (let i = 0; i < fields.length; i++) {
    let field = fields[i];
    if (!ability.can('create', modelName, field)) {
      return false;
    }
  }
  return ability.can('create', requestData);
}

async function canDelete(ctx, modelName, id, ability) {
  let entity = await ctx.model[modelName].findById(id);
  return ability.can('delete', entity);
}

/**
 *
 * @param {Object} options
 * @param {function} options.getRole - The function returns current user's role, it takes ctx as the first parameter, if is not set, then take ctx.state.me.role for default
 * @param {function} options.getUser - The function returns current user's profile, it takes ctx as the first parameter, if is not set, then take ctx.state.me for default
 * @param {function} options.getRequestData - The function returns the request data, it is only needed in POST, PUT and PATCH requests. it takes ctx as the first parameter, if is not set, then take body for default
 * @param {string} options.action - create, read, update and delete, if is not set, this function will get it base on the request method
 * @params {function} options.getId - The function returns the id of the requested entity, it takes ctx as the first parameter, if is not set, then it will get id from the route params for default
 * @param {string} options.modelName
 * @return function
 */
module.exports = options => {
  return async function(ctx, next) {
    // get current user
    let user = null;
    if (options.getUser) {
      user = options.getUser(ctx);
    } else {
      user = ctx.state.me;
    }
    if (!user) {
      throw new Error('Cannot get current user.');
    }

    // get current user's role
    let role = null;
    if (options.getRole) {
      role = options.getRole(ctx);
    } else if (ctx.state.me) {
      role = ctx.state.me.role;
    }
    if (!role) {
      throw new Error("Cannot get current user's role.");
    }

    // get request data
    let requestData = null;
    if ([ 'POST', 'PUT', 'PATCH' ].indexOf(ctx.request.method.toUpperCase()) > -1) {
      if (options.getRequestData) {
        requestData = options.getRequestData(ctx);
      } else {
        requestData = ctx.request.body;
      }
    }

    // get action
    let action = options.action;
    if (!action) {
      action = actionMappings[ctx.request.method.toUpperCase()];
    }

    // get entity id
    let id = null;
    if (action != 'create') {
      if (options.getId) {
        id = options.getId(ctx);
      } else {
        id = ctx.params.id;
      }
    }

    let modelName = options.modelName;
    if (!modelName) {
      throw new Error('Cannot get model name.');
    }

    // get rules
    // check if this role exist
    if (!ctx.app.rules[role]) {
      ctx.throw(403, `You are not allowed to ${action} ${modelName}`);
      return;
    }
    // check if the rules of the model exist
    if (!ctx.app.rules[role][modelName]) {
      ctx.throw(403, `You are not allowed to ${action} ${modelName}`);
      return;
    }
    let ability = ctx.app.rules[role][modelName](user);
    let can = false;
    if (action == 'read') {
      can = await canRead(ctx, modelName, id, ability);
    } else if (action == 'update') {
      can = await canUpdate(ctx, modelName, id, requestData, ability);
    } else if (action == 'create') {
      can = await canCreate(ctx, modelName, requestData, ability);
    } else if (action == 'delete') {
      can = await canDelete(ctx, modelName, id, ability);
    }
    if (!can) {
      ctx.status = 403;
      ctx.body = `You are not allowed to ${action} ${modelName}`;
      return;
    }
    const fields = {};
    permittedFieldsOf(ability, 'read', modelName, {
      fieldsFrom: rule => {
        if (rule.fields) {
          if (rule.inverted) {
            rule.fields.forEach(f => fields[f] = 0);
          } else {
            rule.fields.forEach(f => fields[f] = 1);
          }
        }
        return rule.fields || [];
      }
    });
    ctx.state.fields = fields;
    ctx.state.ability = ability;
    await next();
  };
};
