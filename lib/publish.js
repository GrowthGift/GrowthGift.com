if(Meteor.isServer) {

  // Notifications
  Meteor.publish('notifications', function() {
    if(!this.userId) {
      this.ready();
      return false;
    }
    return NotificationsCollection.find({userId: this.userId});
  });

}