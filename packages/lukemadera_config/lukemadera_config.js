Config ={};
Config.ENV =false;

Config.init =function(params) {
  if(Meteor.isServer) {
    var env ='dev';   //DEFAULT
    if(process.env !==undefined && process.env.ENV !==undefined) {
      env =process.env.ENV;
    }
    else if(Meteor.settings !==undefined && Meteor.settings.public !==undefined && Meteor.settings.public.env !==undefined) {
      env =Meteor.settings.public.env;
    }
    Config.ENV =env;
    console.info('Config.ENV: '+Config.ENV);
  }
  if(Meteor.isClient) {
    var env ='dev';   //DEFAULT
    if(Meteor.settings !==undefined && Meteor.settings.public !==undefined && Meteor.settings.public.env !==undefined) {
      env =Meteor.settings.public.env;
    }
    Config.ENV =env;
    console.info('Config.ENV: '+Config.ENV);
  }
};

Config.init({});

Config.appInfo =function(params) {
  var ret ={
    name: 'Growth Gift Dev',
    version: '1.2.0',
    domain: 'localhost',
    shortDomain: 'localhost',
    scheme: 'http',
    port: '3000',
    mobileApps: {
      android: {
        link: 'https://play.google.com/store/apps/details?id=com.idmhuhu81ewth241q5f8l3'
      },
      ios: {
        link: 'https://itunes.apple.com/us/app/growth-gift/id1064362492'
      }
    },
    facebook: {
      appId: '1637200843214153'
    },
    twitter: {
      handle: 'GrowthGift'
    }
  };
  if(Config.ENV ==='prod') {
    ret.name ='Growth Gift';
    ret.domain ='growthgift.com';
    ret.shortDomain ='gr0.co';
    ret.scheme ='http';
    ret.port =null;
    ret.facebook.appId ='1637200623214175';
  }

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