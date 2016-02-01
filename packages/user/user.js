/**
Handles updates to user profile. Should NOT do creates of new users.
*/
msUser.saveProfile =function(userProfile, docId, userId, callback) {
  if(!docId && docId !==userId) {
    if(Meteor.isClient) {
      nrAlert.alert("You may only edit your own user.");
    }
  }
  else {
    var modifier ={
      $set: {}
    };
    var user =Meteor.users.findOne({ _id: docId }, { fields: { profile: 1 } });
    if(!user.profile) {
      modifier.$set.profile =userProfile;
      modifier.$set.profile.updatedAt =msTimezone.curDateTime();
    }
    else {
      var key;
      for(key in userProfile) {
        modifier.$set["profile."+key] =userProfile[key];
      }
      modifier.$set["profile.updatedAt"] =msTimezone.curDateTime();
    }

    Meteor.users.update({_id:docId}, modifier, callback);
  }
};