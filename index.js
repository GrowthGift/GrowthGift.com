Meteor.startup(function() {
  if (Meteor.isClient) {
    // GoogleMaps.initialize();

    //set publishable key
    // Config.stripe({});

    // Redirect short domain to regular domain
    var appInfo =Config.appInfo({});
    if( (appInfo.shortDomain !== appInfo.domain ) && window.location.hostname ===appInfo.shortDomain) {
      var regEx =new RegExp(appInfo.shortDomain);
      var newLoc =window.location.href.replace(regEx, appInfo.domain);
      console.info("Redirecting "+appInfo.shortDomain+" to "+appInfo.domain+" ...");
      window.location.href =newLoc;
    }
  }

  if(Meteor.isServer) {
    var cfgEmail =Config.email({});
    Meteor.Sendgrid.config({
      username: cfgEmail.sendgrid.username,
      password: cfgEmail.sendgrid.password
    });
    
  }
});