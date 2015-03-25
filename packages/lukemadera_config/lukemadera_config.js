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
    console.log('Config.ENV: '+Config.ENV);
  }
  if(Meteor.isClient) {
    var env ='dev';   //DEFAULT
    if(Meteor.settings !==undefined && Meteor.settings.public !==undefined && Meteor.settings.public.env !==undefined) {
      env =Meteor.settings.public.env;
    }
    Config.ENV =env;
    console.log('Config.ENV: '+Config.ENV); 
  }
};

Config.init({});

Config.appInfo =function(params) {
  var ret ={
    name: 'todoseedDev',
    version: '0.0.1'
  };
  if(Config.ENV ==='prod') {
    ret.name ='todoseed';
  }
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