Config.email =function(params) {
  var appName =Config.vars.APP_NAME || 'Growth Gift Dev';
  var emailDomain =Config.vars.APP_DOMAIN || 'growthgiftdev.meteor.com';
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
      username: Config.vars.SENDGRID_USERNAME || null,
      password: Config.vars.SENDGRID_PASSWORD || null
    };
  }
  
  return ret;
};