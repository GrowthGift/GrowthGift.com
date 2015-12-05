ggFriend ={};

// Sets userId to follow followUserId
ggFriend.follow =function(userId, followUserId, callback) {
  if(userId ===followUserId) {
    return;
  }
  var friend =FriendsCollection.findOne({userId: userId});

  var updatedAt =ggConstants.curDateTime();
  var followUser ={
    userId: followUserId,
    relation: 'following',
    updatedAt: updatedAt
  };

  // insert
  if(!friend) {
    var doc ={
      userId: userId,
      users: [ followUser ]
    };
    FriendsCollection.insert(doc, callback);
  }
  else {
    // update
    var modifier;
    if(!friend.users || !friend.users.length) {
      modifier ={
        $set: {
          users: [ followUser ]
        }
      };
    }
    else {
      // See if already exists
      var followIndex =_.findIndex(friend.users, 'userId', followUserId);
      if(followIndex >-1) {
        // Already following, do nothing
        if(friend.users[followIndex].relation ==='following') {
          return;
        }
        modifier ={
          $set: {}
        };
        modifier.$set['users.'+followIndex+'.relation'] ='following';
        modifier.$set['users.'+followIndex+'.updatedAt'] =updatedAt;
      }
      else {
        modifier ={
          $push: {
            users: {
              $each: [ followUser ]
            }
          }
        };
      }
    }
    FriendsCollection.update({ userId:userId }, modifier, callback);
  }

};

// Removes followUserId from userId friends.users
ggFriend.unfollow =function(userId, unfollowUserId, callback) {
  if(userId ===unfollowUserId) {
    return;
  }
  var friend =FriendsCollection.findOne({userId: userId});
  if(!friend || !friend.users || !friend.users.length) {
    return;
  }
  var modifier ={
    $pull: {
      users: {
        userId: {
          $in: [ unfollowUserId ]
        }
      }
    }
  };
  FriendsCollection.update({ userId: userId }, modifier, callback);
};

// Returns true if userId is following followUserId
ggFriend.isFollowing =function(userId, followUserId, friend) {
  var friend =friend || FriendsCollection.findOne({userId: userId});
  if(!friend || !friend.users || !friend.users.length) {
    return false;
  }
  var followIndex =_.findIndex(friend.users, 'userId', followUserId);
  if(followIndex >-1 && friend.users[followIndex].relation ==='following') {
    return true;
  }
  return false;
};