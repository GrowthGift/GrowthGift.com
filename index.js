Meteor.startup(function() {
  if (Meteor.isClient) {
    // GoogleMaps.initialize();

    //set publishable key
    // Config.stripe({});
  }

  if(Meteor.isServer) {
    var cfgEmail =Config.email({});
    Meteor.Sendgrid.config({
      username: cfgEmail.sendgrid.username,
      password: cfgEmail.sendgrid.password
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