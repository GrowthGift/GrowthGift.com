Package.describe({
  name: 'lukemadera:notify',
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
  api.versionsFrom('1.0.3.2');
  api.addFiles([
    'lukemadera_notify.js',
    'lukemadera_notify-separate-users.js',
    'lukemadera_notify-db.js'
  ]);
  api.addFiles([
    'server/lukemadera_notify-send.js',
    'server/lukemadera_notify-types.js'
  ], 'server');

  api.export('lmNotify');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('lukemadera:notify');
  api.addFiles('lukemadera_notify-tests.js');
});
