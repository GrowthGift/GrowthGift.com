/**
Meteor.startup calls will likely run BEFORE the (frontend) config variables
 are set. So, this function will be called AFTER they are initialized. Any
 startup that depends on the config should be called from here.
*/
Config.startup =function() {
  if(Meteor.isServer) {
    var cfgEmail =Config.email({});
    Meteor.Sendgrid.config({
      username: cfgEmail.sendgrid.username,
      password: cfgEmail.sendgrid.password
    });
  }
  if(Meteor.isClient) {
    // GoogleMaps.initialize();

    //set publishable key
    // Config.stripe({});
  }
};