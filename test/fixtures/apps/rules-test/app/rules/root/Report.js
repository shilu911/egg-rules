'use strict';
const AbilityBuilder = require('@casl/ability').AbilityBuilder;

const getAbility = user => {
  const ability = AbilityBuilder.define({
    subjectName: () => 'Report',
  }, (can, cannot) => {
    can('manage', 'all');
  });
  return ability;
};

module.exports = getAbility;
