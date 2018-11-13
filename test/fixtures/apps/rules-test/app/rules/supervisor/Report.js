'use strict';
const AbilityBuilder = require('@casl/ability').AbilityBuilder;

const getAbility = user => {
  const ability = AbilityBuilder.define({
    subjectName: () => 'Report',
  }, (can, cannot) => {
    can('read', 'Report');
    can('create', 'Report');
    cannot('read', 'Report', 'rootOnly');
    can(['update', 'update', 'delete'], 'Report', {
      owner: user.id,
      isReviewed: false,
    });
    cannot(['create', 'update'], 'Report', ['rootOnly', 'isReviewed', 'owner'])
  });
  return ability;
};

module.exports = getAbility;
