Package.describe({
  name: 'meteorseed:user',
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
  api.addFiles([
    'user-vars.js',
    'user.js',
    'user-get.js'
  ]);
  api.export('msUser');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('meteorseed:user');
  api.addFiles('user-tests.js');
});
