Meteor.methods({
  userFollow: function(followUserId) {
    ggFriend.follow(Meteor.userId(), followUserId, function(err, result) { });
  },
  userUnfollow: function(unfollowUserId) {
    ggFriend.unfollow(Meteor.userId(), unfollowUserId, function(err, result) { });
  }
});

if(Meteor.isClient) {
  Template.user.created =function() {
    Meteor.subscribe('user-username', Template.instance().data.username);
  };

  Template.user.helpers({
    data: function() {
      if(!this.username) {
        Router.go('myGames');
        return {};
      }
      var user =Meteor.users.findOne({ username: this.username });
      if(!user) {
        return {
          _xNotFound: true,
          _xHref: ggUrls.myGames()
        };
      }

      user.xDisplay ={
        img: ggUrls.img('users')+'user-silhouette.jpg'
      };
      var ret ={
        user: user,
        isFollowing: ( Meteor.userId() &&
         ggFriend.isFollowing(Meteor.userId(), user._id, null) ) || false,
        isSelf: ( Meteor.userId() && Meteor.userId() ===user._id ) ? true : false
      };
      return ret;
    }
  });

  Template.user.events({
    'click .user-follow': function(evt, template) {
      var user =Meteor.users.findOne({ username: this.username });
      Meteor.call('userFollow', user._id);
    },
    'click .user-unfollow': function(evt, template) {
      var user =Meteor.users.findOne({ username: this.username });
      Meteor.call('userUnfollow', user._id);
    }
  });
}