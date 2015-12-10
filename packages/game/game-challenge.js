ggGame.getUserGameChallenges =function(gameId, userId) {
  if(!gameId || !userId) {
    return [];
  }
  var userGame =ggGame.getUserGame(gameId, userId);
  if(!userGame || !userGame.challenges) {
    return [];
  }
  return _.sortByOrder(userGame.challenges.map(function(challenge) {
    return _.extend({}, challenge, {
      xDisplay: {
        createdAt: moment(challenge.createdAt, ggConstants.dateTimeFormat).fromNow()
      }
    });
  }), ['createdAt'], ['desc']);
};

ggGame.saveUserGameChallenge =function(doc, docId, callback) {
  if(docId) {
    var modifier =doc;
    UserGamesCollection.update({ _id: docId }, modifier, callback);
  }
  else {
    UserGameSchema.clean(doc);
    doc.createdAt =ggConstants.curDateTime();
    UserGamesCollection.insert(doc, callback);
  }
};

ggGame.saveUserGameChallengeNew =function(game, userId, challenge) {
  var userGame =UserGamesCollection.findOne({ gameId:game._id, userId:userId });
  var gameRule =GameRulesCollection.findOne({ _id:game.gameRuleId });
  var valid =ggMay.addUserGameChallenge(game, userId, userGame, gameRule);
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
      challenge.createdAt =ggConstants.curDateTime();
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

/**
@param {Object} [nowTime] moment()
*/
ggGame.getCurrentChallenge =function(game, gameRule, nowTime) {
  nowTime =nowTime || moment();
  var ret ={
    gameStarted: false,
    gameEnded: false,
    possibleCompletions: 0,
    currentChallenge: null,
    nextChallenge: null
  };
  if(!game || !gameRule || !gameRule.challenges) {
    return ret;
  }

  var gameStart =moment(game.start, ggConstants.dateTimeFormat);
  if(gameStart >nowTime) {
    ret.nextChallenge =_.extend({}, gameRule.challenges[0], {
      start: gameStart.format(ggConstants.dateTimeFormat),
      end: gameStart.clone().add(gameRule.challenges[0].dueFromStart, 'minutes').format(ggConstants.dateTimeFormat)
    });
    return ret;
  }
  ret.gameStarted =true;
  // Assumes challenges are in order by date (due from start)
  var ii, challenge, curChallengeDue, found=false;
  var lastChallengeDue =gameStart;
  for(ii =0; ii<gameRule.challenges.length; ii++) {
    challenge =gameRule.challenges[ii];
    curChallengeDue =gameStart.clone().add(challenge.dueFromStart, 'minutes');
    if(curChallengeDue >nowTime) {
      ret.currentChallenge =_.extend({}, challenge, {
        start: lastChallengeDue.format(ggConstants.dateTimeFormat),
        end: curChallengeDue.format(ggConstants.dateTimeFormat)
      });
      ret.possibleCompletions =(ii+1);
      if(ii <(gameRule.challenges.length-1) ) {
        ret.nextChallenge =_.extend({}, gameRule.challenges[(ii+1)], {
          start: ret.currentChallenge.end,
          end: gameStart.clone().add(gameRule.challenges[(ii+1)].dueFromStart, 'minutes').format(ggConstants.dateTimeFormat)
        });
      }
      found =true;
      break;
    }
    lastChallengeDue =curChallengeDue;
  }
  if(!found) {
    ret.possibleCompletions =gameRule.challenges.length;
    ret.gameEnded =true;
  }
  return ret;
};

ggGame.getGameEnd =function(game, gameRule) {
  if(!game || !gameRule || !gameRule.challenges) {
    return null;
  }

  var gameStart =moment(game.start, ggConstants.dateTimeFormat);
  // Assume in order with the last due date as the last item in the array
  var lastChallenge =gameRule.challenges[(gameRule.challenges.length-1)];
  return gameStart.clone().add(lastChallenge.dueFromStart,
   'minutes').format(ggConstants.dateTimeFormat);
}

ggGame.getGameTimeLeft =function(game, gameRule) {
  if(!game || !gameRule || !gameRule.challenges) {
    return null;
  }
  var ret ={
    amount: -1,
    unit: 'days'
  };

  var gameStart =moment(game.start, ggConstants.dateTimeFormat);
  // Assume in order with the last due date as the last item in the array
  var lastChallenge =gameRule.challenges[(gameRule.challenges.length-1)];
  var gameEnd =gameStart.clone().add(lastChallenge.dueFromStart, 'minutes');
  var now =moment();
  // If game already over, stop
  if(now >gameEnd) {
    return ret;
  }
  // If game has not started yet, compute from game start rather than from now
  var startTime =(now > gameStart) ? now : gameStart;
  ret.amount =gameEnd.clone().diff(startTime.clone(), ret.unit);
  return ret;
};

ggGame.getCurrentUserChallenge =function(gameId, userId, userGame) {
  var ret ={
    numCompletions: 0,
    mostRecentChallenge: null
  };
  if(!gameId || !userGame || !userGame.challenges || !userGame.challenges.length) {
    return ret;
  }

  var challenges =_.sortByOrder(userGame.challenges, ['createdAt'], ['asc']);
  ret.numCompletions =challenges.length;
  ret.mostRecentChallenge =challenges[(challenges.length -1)];
  return ret;
};

/**
We return the buddy actions too but this requires a 2nd iteraction through
 the users so is worse for performance. If we do not need the buddy info
 we could make an option or a separate function that is more performant.
 In this case we would not need the `game` paramater at all either.
*/
ggGame.getUserGamesChallenges =function(userGames, game) {
  // Get users
  var userIds =[];
  userGames.forEach(function(user) {
    userIds.push(user.userId);
  });
  var users =Meteor.users.find({ _id: { $in:userIds } }, { fields: { profile:1, username:1 } }).fetch();

  var userIndex, curUser, gameUserIndex, buddyId, buddyIndex;

  // The first time we won't know all the buddy action totals so we
  // just save the buddy id for a second pass through.
  var users1 =[];
  userGames.forEach(function(ug) {
    curUser ={
      numActions: 0,
      numChallenges: 0
    };

    // Get buddy id for later
    gameUserIndex =game.users ? _.findIndex(game.users, 'userId', ug.userId)
     : -1;
    buddyId =( gameUserIndex >-1 && game.users[gameUserIndex].buddyId) || null;
    if(buddyId) {
      curUser.buddyId =buddyId;
    }

    userIndex =_.findIndex(users, '_id', ug.userId);
    curUser.info =((userIndex >-1) && users[userIndex]) || null;

    if(ug.challenges && ug.challenges.length) {
      curUser.numChallenges =ug.challenges.length;
      ug.challenges.forEach(function(c) {
        if(c.actionCount) {
          curUser.numActions += c.actionCount;
        }
      });
    }

    users1.push(curUser);
  });

  // Fill buddy actions
  var buddyActions;
  return _.sortByOrder(users1.map(function(u) {
    buddyIndex =_.findIndex(users1, 'info._id', u.buddyId);
    if(buddyIndex >-1) {
      u.buddyNumActions =users1[buddyIndex].numActions;
    }
    else {
      // Set default as 0 if not found
      u.buddyNumActions =0;
    }
    return u;
  }), ['numActions'], ['desc']);
};

ggGame.getChallengeTotals =function(game, userGames, gameRule, nowTime) {
  nowTime =nowTime || moment();
  var ret ={
    possible: 0,
    possibleAllUsers: 0,
    userCompletions: 0,
    userActions: 0,
    userGoals: 0,
    numUsers: userGames.length
  };
  var userGameIndex;
  var curChallenge =ggGame.getCurrentChallenge(game, gameRule, nowTime);
  if(curChallenge.possibleCompletions) {
    ret.possible =curChallenge.possibleCompletions;
    ret.possibleAllUsers =curChallenge.possibleCompletions * ret.numUsers;
    userGames.forEach(function(ug) {
      if(ug.challenges && ug.challenges.length) {
        ret.userCompletions +=ug.challenges.length;
        ug.challenges.forEach(function(c) {
          if(c.actionCount) {
            ret.userActions +=c.actionCount;
          }
        });
      }
      // get user goal
      userGameIndex =_.findIndex(game.users, 'userId', ug.userId);
      if(userGameIndex >-1 && game.users[userGameIndex].selfGoal) {
        ret.userGoals +=game.users[userGameIndex].selfGoal;
      }
    });
  }
  return ret;
};