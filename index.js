Meteor.startup(function() {
  if (Meteor.isClient) {
    // GoogleMaps.initialize();

    //set publishable key
    // Config.stripe({});

    // Just redirect to the blog for now
    // window.location.href ='https://blog.growthgift.com';
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