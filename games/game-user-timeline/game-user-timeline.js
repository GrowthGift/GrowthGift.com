if(Meteor.isClient) {

  Template.gameUserTimeline.created =function() {
    Meteor.subscribe('user-game-timeline');
  };

  Template.gameUserTimeline.helpers({
    data: function() {
      return {};
    }
  });
  
}