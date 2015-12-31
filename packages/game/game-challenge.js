ggGame.saveUserGameChallenge =function(doc, docId, userId, gameId, callback) {
  if(docId) {
    var modifier =doc;
    UserGamesCollection.update({ _id: docId }, modifier, callback);
  }
  else {
    // Set challenges id and update updated time
    if(doc.challenges && doc.challenges.length) {
      doc.challenges.forEach(function(challenge, index) {
        if(doc.challenges[index].id ===undefined) {
          doc.challenges[index].id =(Math.random() + 1).toString(36).substring(7);
        }
        doc.challenges[index].updatedAt =msTimezone.curDateTime();
      });
    }
    UserGameSchema.clean(doc);
    UserGamesCollection.insert(doc, callback);
  }
  // Update awards
  ggGame.saveUserAwardsBiggestReach(null, null, userId, gameId, function() {});
};

ggGame.saveUserGameChallengeNew =function(game, userId, challenge, callback) {
  var userGame =UserGamesCollection.findOne({ gameId:game._id, userId:userId });
  var gameRule =GameRulesCollection.findOne({ _id:game.gameRuleId });
  var curChallenge =ggGame.getCurrentChallenge(game, gameRule, null);
  var userChallenge =ggGame.getCurrentUserChallenge(game._id, userId, userGame);
  var valid =ggMay.addUserGameChallenge(game, userId, curChallenge, userChallenge);
  if(!valid) {
    if(Meteor.isClient) {
      nrAlert.alert("You may not add a challenge completion right now. Please try again once the next challenge starts!");
    }
  }
  else {
    var userGame =ggGame.getUserGame(game._id, userId);
    if(!userGame) {
      if(Meteor.isClient) {
        nrAlert.alert("User is not in this game; join the game first.");
      }
    }
    else {
      var modifier ={};
      // See if on last challenge, then remove key
      var onLastChallenge =challenge.onLastChallenge;
      delete challenge.onLastChallenge;

      // If submitted feedback, save that separately
      if(challenge.feedback) {
        var userIndex =_.findIndex(game.users, 'userId', userId);
        if(userIndex >-1) {
          var feedbackObj =challenge.feedback;
          feedbackObj.updatedAt =msTimezone.curDateTime();
          var gameUser =game.users[userIndex];
          if(gameUser.feedback) {
            modifier ={
              $push: {}
            };
            modifier.$push['users.'+userIndex+'.feedback'] = feedbackObj;
          }
          else {
            modifier ={
              $set: {}
            };
            modifier.$set['users.'+userIndex+'.feedback'] =[ feedbackObj ];
          }
          GamesCollection.update({ _id:game._id }, modifier, function(err, result) {});
        }
        delete challenge.feedback;
      }

      // If submitted inspiration, save that separately
      if(challenge.inspiration) {
        ggGame.saveInspiration(game._id, challenge.inspiration);
        delete challenge.inspiration;
      }

      modifier ={};   // Reset in case feedback set it
      challenge.id =(Math.random() + 1).toString(36).substring(7);
      challenge.updatedAt =msTimezone.curDateTime();
      if(!userGame.challenges) {
        modifier ={
          $set: {
            challenges: [ challenge ]
          }
        };
      }
      else {
        modifier ={
          $push: {
            challenges: {
              $each: [ challenge ]
            }
          }
        };
      }

      UserGamesCollection.update({ userId:userId, gameId:game._id }, modifier,
       function (err, result) {
        ggGame.saveUserAwardsBiggestReach(null, game, userId, game._id, function() {});
        if(onLastChallenge) {
          ggGame.saveUserAwardsWeekStreak(null, game, null, null, userId,
           game._id, msTimezone.curDateTime(), function() {});
        }
        callback(err, result);

        // console.info('ggGame.saveUserGameChallengeNew UserGamesCollection.update', challenge, modifier, userId, game._id);

        // Not using notifications any more, focus on human connection instead.
        // // Send notifications
        // if(Meteor.isServer) {
        //   var user =Meteor.users.findOne({ _id: userId }, { fields: { profile: 1} });

        //   var gameUsers =UserGamesCollection.find({ gameId: game._id, userId: { $ne: userId } }).fetch();
        //   var notifyUserIds =gameUsers.map(function(gu) {
        //     return gu.userId;
        //   });
        //   // If public, only send to users who are following this user
        //   if(game.privacy ==='public') {
        //     var following =ggFriend.getFollowing(userId);
        //     if(!following || !following.length) {
        //       notifyUserIds =[];
        //     }
        //     else {
        //       notifyUserIds =notifyUserIds.filter(function(nu) {
        //         return ( _.findIndex(following, 'userId', nu) > -1 ) ? true : false;
        //       });
        //     }
        //   }
        //   if(notifyUserIds.length) {
        //     lmNotify.send('gameChallengeComplete', { game: game, user: user, notifyUserIds: notifyUserIds }, {});
        //   }

        // }

      });
    }
  }
};