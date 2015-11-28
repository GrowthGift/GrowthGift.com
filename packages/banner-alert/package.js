Package.describe({
  name: 'growthgift:banner-alert',
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
  api.use('iron:router@1.0.7');
  api.use('reactive-var@1.0.5');
  api.use('less@2.5.0');

  api.addFiles([
    'banner-alert.html',
    'banner-alert.js',
    // 'banner-alert.css',
    ], 'client');
  api.addFiles('banner-alert.less', 'client', {isImport: true});

  if (api.export){
    api.export('nrAlert');
  }

});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('growthgift:banner-alert');
  api.addFiles('banner-alert-tests.js');
});
