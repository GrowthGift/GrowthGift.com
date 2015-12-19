if(Meteor.isServer) {

  // Notifications
  Meteor.publish('notifications', function() {
    if(!this.userId) {
      this.ready();
      return false;
    }
    return NotificationsCollection.find({userId: this.userId});
  });

  // Users
  Meteor.publish('user-username', function(username) {
    if(username) {
      return Meteor.users.find({username: username}, { fields: { createdAt:1, profile:1, username:1 } });
    }
    this.ready();
    return false;
  });

}