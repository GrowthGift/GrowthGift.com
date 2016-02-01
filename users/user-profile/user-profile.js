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

        var templateInst =msTemplate.getMainTemplate("Template.userProfile");
        Meteor.call("saveUserProfile", insertDoc, templateInst.userId);

        this.done();
        return false;
      }
    }
  });

  Template.userProfile.created =function() {
    this.userId =null;
    this.userImage = new ReactiveVar(null);
  };

  Template.userProfile.helpers({
    data: function() {
      var user =this.user;
      if(!user) {
        return {
          _xNotFound: true,
          _xHref: '/home'
        };
      }

      var templateInst =Template.instance();
      templateInst.userId =user._id;

      user.xDisplay ={
        img: msUser.getImage(user)
      };
      return {
        user: user,
        isSelf: ( Meteor.userId() && Meteor.userId() === user._id ) ? true : false,
        // isFollowing: ( Meteor.userId() &&
        //  ggFriend.isFollowing(Meteor.userId(), user._id, null) ) || false,
        inputOpts: {
          genderOpts: [
            { value: 'female', label: 'Female' },
            { value: 'male', label: 'Male' }
          ],
          imageVal: templateInst.userImage.get(),
          optsImagePicker: {
            classes: {
              btns: 'btn-group',
              btn: 'btn-group-btn',
              saveBtn: 'btn btn-primary margin-tb'
            },
            resizeMax: {
              width: 600,
              height: 600
            },
            onImageSaved: function(err, base64Data) {
              // Delete old one, if it exists
              var existingImage = templateInst.userImage.get() ||
               user.profile.image;
              ggS3.deleteFile(existingImage);

              S3.upload({
                files: [ base64Data ],
                encoding: 'base64'
              }, function(err, result) {
                if(err) {
                  templateInst.userImage.set(null);
                }
                else {
                  templateInst.userImage.set(result.secure_url);
                }
              });
            }
          }
        },
      }
    }
  });
}