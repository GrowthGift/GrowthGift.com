Package.describe({
  name: 'growthgift:mock-data',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use('ecmascript');
  api.use([
    'momentjs:moment@2.10.6',
    'meteorseed:timezone'
  ]);
  api.addFiles([
    'lib/lodash.custom.min.js',
    'mock-data-vars.js',
    'mock-data-user.js',
    'mock-data-game-rule.js',
    'mock-data-game.js',
    'mock-data-user-game.js',
    'mock-data-user-award.js',

    'mock-data-set-game-user.js'
  ]);

  api.export('ggMockData');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  // api.use('velocity:meteor-stubs');
  api.use('growthgift:mock-data');
  api.addFiles([
    'mock-data-tests.js'
  ]);
});
