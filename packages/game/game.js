ggGame.save =function(gameDoc, gameDocId, userId, callback) {
  var valid =true;
  if(gameDocId) {
    var game =GamesCollection.findOne({_id: gameDocId});
    valid =ggMay.editGame(game, userId);
  }
  var slug =(gameDoc.$set && gameDoc.$set.slug) || gameDoc.slug;
  if(slug) {
    var existingDoc =(gameDocId && ({_id: gameDocId})) || null;
    var slugExists =msSlug.exists(slug, 'games', existingDoc, null);
    if(slugExists) {
      valid =false;
    }
  }

  if(!valid) {
    if(Meteor.isClient) {
      nrAlert.alert("Only challenge admins may edit challenges.");
    }
  }
  else {
    if(gameDocId) {
      var modifier =gameDoc;
      var gameRule, gameEnd;
      if(modifier.$set.start) {
        // Must do this BEFORE calculate game end, which expects UTC
        modifier.$set.start =msTimezone.convertToUTC(modifier.$set.start, {});

        // Set game end
        var gameRuleId = modifier.$set.gameRuleId ? modifier.$set.gameRuleId : null;
        if(!gameRuleId) {
          var game =GamesCollection.findOne({ _id: gameDocId }, { fields: { gameRuleId: 1} });
          gameRuleId = game.gameRuleId;
        }
        gameRule =GameRulesCollection.findOne({ _id: gameRuleId });
        gameEnd =ggGame.getGameEnd({ start: modifier.$set.start }, gameRule);
        modifier.$set.end =msTimezone.convertToUTC(gameEnd, {});
      }
      GamesCollection.update({_id:gameDocId}, modifier, callback);
    }
    else {
      gameDoc.start =msTimezone.convertToUTC(gameDoc.start, {});

      // Set game end
      gameRule =GameRulesCollection.findOne({ _id: gameDoc.gameRuleId });
      gameEnd =ggGame.getGameEnd(gameDoc, gameRule);
      gameDoc.end =msTimezone.convertToUTC(gameEnd, {});

      GameSchema.clean(gameDoc);
      if(userId) {
        gameDoc.users =[
          {
            userId: userId,
            role: 'creator',
            status: 'joined',
            buddyRequestKey: (Math.random() + 1).toString(36).substring(7),
            reachTeam: [],
            updatedAt: msTimezone.curDateTime()
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
      var status =ggMay.getGameUserStatus(game.users, userId);
      if( status === "joined" ) {
        nrAlert.success("You are already in this challenge.");
      }
      else {
        nrAlert.alert("You may not join this challenge.");
      }
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
      // Re-lookup for concurrency safety? Or just use the existing version
      // for performance? Need title and slug for buddy notification.
      var game =GamesCollection.findOne({ _id:game._id }, { fields: { users:1, title:1, slug:1 } });
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
          updatedAt: msTimezone.curDateTime()
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
      nrAlert.alert("You may not leave this challenge.");
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
  if(!ggMay.beGameBuddy(game, selfUserId, buddyRequestKey)) {
    if(Meteor.isClient) {
      nrAlert.alert("You may not buddy with this person for this challenge.");
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
  GamesCollection.update({ _id: game._id }, modifier, function(err, result) {
    callback(err, result);

    // Send notification to person who did NOT initiate this action that they
    // now have a buddy.
    if(Meteor.isServer) {
      var notifyUserIds =[buddyUserId, selfUserId];
      // Sending to buddy user with self user's name
      var selfUser =Meteor.users.findOne({ _id: selfUserId }, { fields: { profile: 1} });
      lmNotify.send('gameBuddyAdded', { game: game, buddyUser: selfUser,
       notifyUserIds: [ buddyUserId ] }, {});
    }
  });
};

ggGame.saveReachUser =function(game, userId, inviteUsername, callback) {
  var inviteUserObj =msUser.getByUsername(inviteUsername);
  if(!inviteUserObj) {
    callback(null);
    return;
  }
  var inviteUserId =inviteUserObj._id;
  // Want to add the userId user to the invite user's reach team
  var userIndex =_.findIndex(game.users, 'userId', inviteUserId);
  if(userIndex <0) {
    callback(true, { msg: 'Invite user is not in challenge'});
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

ggGame.saveBuddyRequest =function(game, userSelf, userBuddy, callback) {
  if( !ggMay.requestGameBuddy(game, userSelf._id, userBuddy._id) ) {
    if(Meteor.isClient) {
      nrAlert.alert("You may not buddy with this person for this challenge.");
    }
    callback(true);
    return;
  }
  var gameUserSelfIndex =_.findIndex(game.users, 'userId', userSelf._id);
  var gameUser =game.users[gameUserSelfIndex];
  var buddyRequestObj ={
    userId: userBuddy._id,
    updatedAt: msTimezone.curDateTime()
  };
  var modifier ={};
  if(!gameUser.buddyRequests || !gameUser.buddyRequests.length) {
    modifier.$set ={};
    modifier.$set['users.'+gameUserSelfIndex+'.buddyRequests'] =[ buddyRequestObj ];
  }
  else {
    var existingRequestIndex =_.findIndex(gameUser.buddyRequests, 'userId',
     userBuddy._id);
    if(existingRequestIndex > -1) {
      modifier.$set ={};
      modifier.$set['users.' + gameUserSelfIndex + '.buddyRequests.' +
       existingRequestIndex + '.updatedAt'] = buddyRequestObj.updatedAt;
    }
    else {
      modifier.$push ={};
      modifier.$push['users.'+gameUserSelfIndex+'.buddyRequests'] = buddyRequestObj;
    }
  }
  GamesCollection.update({ _id:game._id }, modifier, function(err, result) {
    callback(err, result);

    // Send notification
    if(Meteor.isServer) {
      var notifyUserIds =[ userBuddy._id ];
      lmNotify.send('gameBuddyRequest', { game: game, user: userSelf,
       buddyRequestKey: gameUser.buddyRequestKey, notifyUserIds: notifyUserIds }, {});
    }
    if(Meteor.isClient) {
      nrAlert.success("A buddy request has been sent to " + userBuddy.profile.name + ". We will let you know if they accept!");
    }
  });
};