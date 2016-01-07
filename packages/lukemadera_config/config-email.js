Config.email =function(params) {
  var appName =Config.vars.APP_NAME || 'todoseed';
  var emailDomain =Config.vars.APP_DOMAIN || 'todoseed.meteor.com';
  var ret ={
    addresses: {
      contact: {
        name: appName+" Contact",
        email: "contact@"+emailDomain
      },
      notify: {
        name: appName+" Notification",
        email: "notify@"+emailDomain
      }
    }
  };

  if(Meteor.isServer) {
    ret.sendgrid ={
      username: Config.vars.SENDGRID_USERNAME || "todoseed",
      password: Config.vars.SENDGRID_PASSWORD || "todoseed"
    };
  }
  
  return ret;
};