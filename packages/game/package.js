Package.describe({
  name: 'growthgift:game',
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
  api.use('momentjs:moment@2.10.6');
  api.use('meteorseed:timezone');
  api.use('growthgift:constants');
  api.use('growthgift:may');
  api.use('growthgift:user');
  api.addFiles([
    'game-vars.js',
    'game-get.js',
    'game.js',
    'game-challenge.js'
  ]);
  api.export('ggGame');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('momentjs:moment@2.10.6');
  api.use('meteorseed:timezone');
  api.use('growthgift:mock-data');
  api.use('growthgift:game');
  api.addFiles([
    'lib/lodash.custom.min.js',
    'game-challenge-tests.js',
    'game-get-tests.js',
    'game-tests.js'
  ]);
});
