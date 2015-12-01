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

ggGame.saveUserGameChallenge =function(game, userId, challenge) {
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
        // console.info('ggGame.saveUserGameChallenge UserGamesCollection.update', challenge, modifier, userId, game._id);
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
    nextChallengeStart: null
  };
  if(!game || !gameRule || !gameRule.challenges) {
    return ret;
  }

  var gameStart =moment(game.start, ggConstants.dateTimeFormat);
  if(gameStart >nowTime) {
    ret.nextChallengeStart =gameStart.format(ggConstants.dateTimeFormat);
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
        ret.nextChallengeStart =ret.currentChallenge.end;
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

ggGame.getUserGamesChallenges =function(gameId, userGames) {
  // Get users
  var userIds =[];
  userGames.forEach(function(user) {
    userIds.push(user.userId);
  });
  var users =Meteor.users.find({ _id: { $in:userIds } }, { fields: { profile:1 } }).fetch();

  var user ={};
  var userIndex;
  return _.sortByOrder(userGames.map(function(ug) {
    userIndex =_.findIndex(users, '_id', ug.userId);
    user =((userIndex >-1) && users[userIndex]) || {
      profile: {
        name: 'First Last'
      }
    };
    return {
      userName: user.profile.name,
      numChallenges: ((ug.challenges && ug.challenges.length) || 0)
    };
  }), ['userName'], ['asc']);
};

ggGame.getChallengeTotals =function(game, userGames, gameRule, nowTime) {
  nowTime =nowTime || moment();
  var ret ={
    possible: 0,
    possibleAllUsers: 0,
    userCompletions: 0,
    numUsers: userGames.length
  };
  var curChallenge =ggGame.getCurrentChallenge(game, gameRule, nowTime);
  if(curChallenge.possibleCompletions) {
    ret.possible =curChallenge.possibleCompletions;
    ret.possibleAllUsers =curChallenge.possibleCompletions *ret.numUsers;
    userGames.forEach(function(ug) {
      if(ug.challenges && ug.challenges.length) {
        ret.userCompletions +=ug.challenges.length;
      }
    });
  }
  return ret;
};