Package.describe({
  name: 'growthgift:nav-secondary',
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
  api.versionsFrom('1.2.0.2');
  api.use('ecmascript');
  api.use('templating@1.0.0');
  api.use('blaze@2.0.0');
  api.use('reactive-var@1.0.5');
  api.use('less@2.5.0');

  api.addFiles([
    'nav-secondary.html',
    'nav-secondary.js'
  ], 'client');
  api.addFiles('nav-secondary.less', 'client', {isImport: true});
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('growthgift:nav-secondary');
  api.addFiles('nav-secondary-tests.js');
});
