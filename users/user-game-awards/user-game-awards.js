if(Meteor.isClient) {
  // Template.userGameAwards.created =function() {
  // };

  Template.userGameAwards.helpers({
    data: function() {
      var user =this.user;
      return {
        user: user
      }
    }
  });
}