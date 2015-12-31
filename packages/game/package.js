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
  api.use('meteorseed:user');
  api.addFiles([
    'game-vars.js',
    'lib/collections.js',
    'game-get.js',
    'game-get-awards.js',
    'game-get-inspiration.js',
    'game.js',
    'game-awards.js',
    'game-challenge.js',
    'game-inspiration.js',
    'game-get-cache.js'
  ]);
  api.export('ggGame');
});

Package.onTest(function(api) {
  api.use([
    'ecmascript',
    'tinytest',
    'momentjs:moment@2.10.6',
    'meteorseed:timezone',
    'growthgift:mock-data',
    'growthgift:game'
  ]);
  api.addFiles([
    'lib/test-env.js',
    'lib/lodash.custom.min.js',
    'lib/collections.js',
    'game-tests.js',
    'game-awards-tests.js',
    'game-challenge-tests.js',
    'game-get-tests.js'
  ]);
});
