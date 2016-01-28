if(Meteor.isClient) {
  Template.userGameTimeline.helpers({
    data: function() {
      var user =this.user;
      return {
        user: user
      }
    }
  });
}