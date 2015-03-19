Config ={};
Config.ENV =false;

//http://stackoverflow.com/questions/14184643/detecting-environment-with-meteor-js
Meteor.methods({
  getEnvironment: function() {
    var env ='dev';   //DEFAULT
    if(Meteor.isServer) {
      if(process.env !==undefined && process.env.ENV !==undefined) {
        env =process.env.ENV;
      }
      else if(Meteor.settings !==undefined && Meteor.settings.env !==undefined) {
        env =Meteor.settings.env;
      }
      Config.ENV =env;
      console.log('Config.ENV: '+Config.ENV);
    }
    return env;
  }
});

if(Meteor.isClient) {
  Meteor.call("getEnvironment", function(err, result) {
    Config.ENV =result;
    console.log('Config.ENV: '+Config.ENV);
  });
}

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