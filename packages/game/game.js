ggGame.save =function(gameDoc, gameDocId, userId, callback) {
  var valid =true;
  if(gameDocId) {
    var game =GamesCollection.findOne({_id: gameDocId});
    valid =ggMay.editGame(game, userId);
  }
  var slug =(gameDoc.$set && gameDoc.$set.slug) || gameDoc.slug;
  if(slug) {
    var existingDoc =(gameDocId && ({_id: gameDocId})) || null;
    var slugExists =ggSlug.exists(slug, 'games', existingDoc, null);
    if(slugExists) {
      valid =false;
    }
  }

  if(!valid) {
    if(Meteor.isClient) {
      nrAlert.alert("Only game admins may edit games.");
    }
  }
  else {
    if(gameDocId) {
      var modifier =gameDoc;
      GamesCollection.update({_id:gameDocId}, modifier, callback);
    }
    else {
      GameSchema.clean(gameDoc);
      if(userId) {
        gameDoc.users =[
          {
            userId: userId,
            role: 'creator',
            status: 'joined',
            buddyRequestKey: (Math.random() + 1).toString(36).substring(7),
            reachTeam: [],
            updatedAt: ggConstants.curDateTime()
          }
        ];
      }
      var gameId =GamesCollection.insert(gameDoc, callback);

      // On insert, need to add to user games collection too
      var doc ={
        userId: userId,
        gameId: gameId
      };
      UserGamesCollection.insert(doc, function(err, result) {
        // console.info('ggGame.save UserGamesCollection.insert', doc, err, result);
      });
    }
  }
};

ggGame.join =function(game, userId, buddyRequestKey, inviteUsername, callback) {
  var valid =ggMay.joinGame(game, userId);
  if(!valid) {
    if(Meteor.isClient) {
      nrAlert.alert("You may not join this game.");
    }
  }
  else {
    var userGame =ggGame.getUserGame(game._id, userId);
    if(userGame) {
      callback(null, {});
    }
    else {
      var doc ={
        userId: userId,
        gameId: game._id
      };
      UserGamesCollection.insert(doc, function(err, result) {
        // console.info('ggGame.join UserGamesCollection.insert', doc, err, result);
      });

      // Add to game.users as well
      var game =GamesCollection.findOne({ _id:game._id }, { fields: { users:1 } });
      var userIndex =_.findIndex(game.users, 'userId', userId);
      if(userIndex >=0) {
        if(buddyRequestKey) {
          ggGame.saveBuddy(game, userId, buddyRequestKey, callback);
        }
        else if(inviteUsername) {
          ggGame.saveReachUser(game, userId, inviteUsername, callback);
        }
        else {
          callback(null, {});
        }
      }
      else {
        var userObj ={
          userId: userId,
          status: 'joined',
          buddyRequestKey: (Math.random() + 1).toString(36).substring(7),
          updatedAt: ggConstants.curDateTime()
        };
        var modifier ={
          $push: {
            users: {
              $each: [ userObj ]
            }
          }
        };
        GamesCollection.update({ _id:game._id }, modifier, function(err, result) {
          if(buddyRequestKey) {
            // Need to update the local copy of the game with the changes we
            // made so the new user is in the game.
            game.users.push(userObj);
            ggGame.saveBuddy(game, userId, buddyRequestKey, callback);
          }
          else if(inviteUsername) {
            ggGame.saveReachUser(game, userId, inviteUsername, callback);
          }
          else {
            callback(null, result);
          }
        });
      }
    }
  }
};

ggGame.leave =function(game, userId, callback) {
  var valid =ggMay.leaveGame(game, userId);
  if(!valid) {
    if(Meteor.isClient) {
      nrAlert.alert("You may not leave this game.");
    }
  }
  else {
    UserGamesCollection.remove({ gameId:game._id, userId:userId }, function(err, result) {
      // console.info('ggGame.leave UserGamesCollection.remove', game._id, userId, err, result);
    });

    // Remove from game.users as well
    var modifier ={
      $pull: {
        users: {
          userId: {
            $in: [ userId ]
          }
        }
      }
    };

    // TODO - IF had a buddy, unbuddy so the buddy can rebuddy?

    GamesCollection.update({ _id:game._id }, modifier, callback);
  }
};

/**
@param {Object} gameUserData All data to $set in the games.users[userIndex] object
  @param {String} selfGoal
*/
ggGame.saveGameInvite =function(game, userId, gameUserData, callback) {
  var gameUserIndex =(game && game.users && userId ) ?
   _.findIndex(game.users, 'userId', userId) : -1;
  if(gameUserIndex <0) {
    callback(true);
    return;
  }
  var gameUser =game.users[gameUserIndex];

  var modifier ={
    $set: {}
  };
  var key;
  for(key in gameUserData) {
    modifier.$set['users.'+gameUserIndex+'.'+key] =gameUserData[key];
  }
  GamesCollection.update({ _id: game._id }, modifier, callback);
};

ggGame.saveBuddy =function(game, selfUserId, buddyRequestKey, callback) {
  if(!ggMay.beGameBuddy(game, null, buddyRequestKey)) {
    if(Meteor.isClient) {
      nrAlert.alert("You may buddy with this person for this game.");
    }
    callback(true);
    return;
  }
  var gameUserSelfIndex =_.findIndex(game.users, 'userId', selfUserId);
  var gameUserBuddyIndex =_.findIndex(game.users, 'buddyRequestKey', buddyRequestKey);
  var buddyUserId =game.users[gameUserBuddyIndex].userId;
  if(gameUserSelfIndex <0 || gameUserBuddyIndex <0) {
    callback(true);
    return;
  }
  var modifier ={
    $set: {}
  };
  // Set buddy id to each other (self to buddy and buddy to self).
  modifier.$set['users.'+gameUserSelfIndex+'.buddyId'] =buddyUserId;
  modifier.$set['users.'+gameUserBuddyIndex+'.buddyId'] =selfUserId;
  GamesCollection.update({ _id: game._id }, modifier, callback);
};

ggGame.saveReachUser =function(game, userId, inviteUsername, callback) {
  var inviteUserObj =ggUser.getByUsername(inviteUsername);
  if(!inviteUserObj) {
    callback(null);
    return;
  }
  var inviteUserId =inviteUserObj._id;
  // Want to add the userId user to the invite user's reach team
  var userIndex =_.findIndex(game.users, 'userId', inviteUserId);
  if(userIndex <0) {
    callback(true, { msg: 'Invite user is not in game'});
    return;
  }
  var reachTeam =game.users[userIndex].reachTeam;
  var modifier =null;
  if(!reachTeam || !reachTeam.length) {
    modifier ={
      $set: { }
    };
    modifier.$set['users.'+userIndex+'.reachTeam'] =[
      {
        userId: userId
      }
    ];
  }
  else {
    var reachUserIndex =_.findIndex(reachTeam, 'userId', userId);
    if(reachUserIndex >=0) {
      // User already on reach team, nothing to do
      callback(null);
      return;
    }
    if(reachUserIndex <0) {
      modifier ={
        $push: { }
      };
      modifier.$push['users.'+userIndex+'.reachTeam'] ={
        userId: userId
      };
    }
  }
  GamesCollection.update({ _id: game._id }, modifier, callback);
};