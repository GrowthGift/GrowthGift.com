Meteor.methods({
  saveUserProfile: function(userProfile, docId) {
    msUser.saveProfile(userProfile, docId, Meteor.userId(), function(err, result) { });
  }

  // userFollow: function(followUserId) {
  //   ggFriend.follow(Meteor.userId(), followUserId, function(err, result) { });
  // },
  // userUnfollow: function(unfollowUserId) {
  //   ggFriend.unfollow(Meteor.userId(), unfollowUserId, function(err, result) { });
  // }
});

if(Meteor.isClient) {
  AutoForm.hooks({
    userProfileForm: {
      onSubmit: function(insertDoc, updateDoc, currentDoc) {
        var self =this;
        //without this, the Meteor.call line submits the form..
        this.event.preventDefault();
        this.event.stopPropagation();

        var templateInst =msTemplate.getMainTemplate("Template.user");
        Meteor.call("saveUserProfile", insertDoc, templateInst.userId);

        this.done();
        return false;
      }
    }
  });

  Template.user.created =function() {
    if(Template.instance().data && Template.instance().data.username) {
      Meteor.subscribe('user-username', Template.instance().data.username);
    }
    this.userId =null;
  };

  Template.user.helpers({
    data: function() {
      if(!this.username) {
        if(Meteor.user() && Meteor.user().username) {
          // Use logged in user
          Router.go('/u/'+Meteor.user().username);
          return {};
        }
        else {
          Router.go('home');
          return {};
        }
      }
      var user =Meteor.users.findOne({ username: this.username });
      if(!user) {
        return {
          _xNotFound: true,
          _xHref: '/home'
        };
      }

      Template.instance().userId =user._id;
      user.xDisplay ={
        img: msUser.getImage(user)
      };
      var ret ={
        user: user,
        // isFollowing: ( Meteor.userId() &&
        //  ggFriend.isFollowing(Meteor.userId(), user._id, null) ) || false,
        isSelf: ( Meteor.userId() && Meteor.userId() ===user._id ) ? true : false,
        inputOpts: {
          genderOpts: [
            { value: 'female', label: 'Female' },
            { value: 'male', label: 'Male' }
          ]
        }
      };

      return ret;
    }
  });

  // Template.user.events({
  //   'click .user-follow': function(evt, template) {
  //     var user =Meteor.users.findOne({ username: this.username });
  //     Meteor.call('userFollow', user._id);
  //   },
  //   'click .user-unfollow': function(evt, template) {
  //     var user =Meteor.users.findOne({ username: this.username });
  //     Meteor.call('userUnfollow', user._id);
  //   }
  // });
}