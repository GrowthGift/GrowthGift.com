Meteor.startup(function() {
  if (Meteor.isClient) {
    // GoogleMaps.initialize();

    //set publishable key
    // Config.stripe({});

    // Redirect short domain to regular domain
    var appInfo =Config.appInfo({});
    if(window.location.hostname ===appInfo.shortDomain) {
      var regEx =new RegExp(appInfo.shortDomain);
      var newLoc =window.location.href.replace(regEx, appInfo.domain);
      console.info("Redirecting "+appInfo.shortDomain+" to "+appInfo.domain+" ...");
      window.location.href =newLoc;
    }
  }

  if(Meteor.isServer) {
    var cfgEmail =Config.email({});
    Meteor.Mandrill.config({
      username: cfgEmail.mandrill.username,
      key: cfgEmail.mandrill.apiKey
    });

    Meteor.publish('user-notifications', function() {
      if(this.userId) {
        // return lmNotify.readNotifications(this.userId, {});
        return NotificationsCollection.find({userId: this.userId});
      }
      else {
        this.ready();
        return false;
      }
    });
    
  }
});