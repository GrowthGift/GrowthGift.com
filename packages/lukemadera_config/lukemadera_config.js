Config ={
  vars: {}
};

Config.init =function(params) {
};

Config.setVars =function() {
  var key;

  if(Meteor.isServer) {
    var allowedPublic =[
      'APP_NAME',
      'APP_DOMAIN', 'APP_SHORT_DOMAIN',
      'APP_SCHEME', 'APP_PORT'
    ];

    if(Meteor.settings ===undefined) {
      Meteor.settings ={};
    }

    // If no Meteor settings environment variable, try to load a default one.
    if(process.env.METEOR_SETTINGS === undefined) {
      var fs = Npm.require('fs');
      var rootPath =process.env.PWD + '/';
      var path =rootPath + 'env/localhost/settings.json';
      if(fs.existsSync(path)) {
        var settingsObj =fs.readFileSync(path, { encoding: 'utf8' });
        settingsObj =JSON.parse(settingsObj);
        for(key in settingsObj) {
          if(key !== 'public' && Meteor.settings[key] ===undefined) {
            Meteor.settings[key] =settingsObj[key];
          }
        }
      }
    }

    if(Meteor.settings.public ===undefined) {
      Meteor.settings.public ={};
    }
    if(Meteor.settings.public.vars ===undefined) {
      Meteor.settings.public.vars ={};
    }
    // for(key in process.env) {
    //   Config.vars[key] =process.env[key];
    //   if( allowedPublic.indexOf(key) > -1 ) {
    //     Meteor.settings.public.vars[key] =Config.vars[key];
    //   }
    // }
    for(key in Meteor.settings) {
      if(key !== 'public') {
        Config.vars[key] =Meteor.settings[key];
        if( allowedPublic.indexOf(key) > -1 ) {
          Meteor.settings.public.vars[key] =Config.vars[key];
        }
      }
    }
  }

  if(Meteor.isClient) {
    for(key in Meteor.settings.public.vars) {
      Config.vars[key] =Meteor.settings.public.vars[key];
    }
  }
};

Config.init({});
Meteor.startup(function() {
  Config.setVars();
});

Config.appInfo =function(params) {
  var ret ={
    name: Config.vars.APP_NAME || 'todoseed',
    domain: Config.vars.APP_DOMAIN || 'localhost',
    shortDomain: Config.vars.APP_SHORT_DOMAIN || 'localhost',
    scheme: Config.vars.APP_SCHEME || 'http',
    port: Config.vars.APP_PORT || null,
    version: '0.0.1'
  };

  // http://localhost:3000
  ret.rootUrl =ret.scheme + '://' + ret.domain + ( ret.port ? (':' + ret.port) : '');
  // https://short.co
  ret.shortRootUrl =ret.scheme + '://' + ret.shortDomain + ( ret.port ? (':' + ret.port) : '');

  return ret;
};

Config.paths =function(params) {
  var baseImg ='/img';    //do not need to include the 'public' in front
  var ret ={
    img: {
      base: baseImg,
      bg: baseImg+'/backgrounds'
    }
  };
  return ret;
};