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
      'APP_SCHEME', 'APP_PORT',
      'FACEBOOK_APP_ID'
    ];

    if(Meteor.settings ===undefined) {
      Meteor.settings ={};
    }
    if(Meteor.settings.public ===undefined) {
      Meteor.settings.public ={};
    }
    if(Meteor.settings.public.vars ===undefined) {
      Meteor.settings.public.vars ={};
    }
    for(key in process.env) {
      Config.vars[key] =process.env[key];
      if( allowedPublic.indexOf(key) > -1 ) {
        Meteor.settings.public.vars[key] =process.env[key];
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
    name: Config.vars.APP_NAME || 'Growth Gift Dev',
    domain: Config.vars.APP_DOMAIN || 'localhost',
    shortDomain: Config.vars.APP_SHORT_DOMAIN || 'localhost',
    scheme: Config.vars.APP_SCHEME || 'http',
    port: Config.vars.APP_SCHEME || null,
    version: '1.2.1',
    mobileApps: {
      android: {
        link: 'https://play.google.com/store/apps/details?id=com.idmhuhu81ewth241q5f8l3'
      },
      ios: {
        link: 'https://itunes.apple.com/us/app/growth-gift/id1064362492'
      }
    },
    facebook: {
      appId: Config.vars.FACEBOOK_APP_ID || null
    },
    twitter: {
      handle: 'GrowthGift'
    }
  };

  // Social share testing
  // ret.domain ='growthgiftdev.meteor.com';
  // ret.shortDomain ='growthgiftdev.meteor.com';
  // ret.port =null;

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