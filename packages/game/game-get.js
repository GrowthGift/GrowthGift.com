ggGame.getUserGame =function(gameId, userId) {
  return UserGamesCollection.findOne({gameId: gameId, userId: userId});
};

/**
Gets a game user by user id OR buddy request key.
*/
ggGame.getGameUser =function(game, userId, params) {
  var gameUserIndex;
  if(!userId && params.buddyRequestKey) {
    gameUserIndex =(game && game.users ) ?
     _.findIndex(game.users, 'buddyRequestKey', params.buddyRequestKey) : -1;
  }
  else {
    gameUserIndex =(game && game.users && userId ) ?
     _.findIndex(game.users, 'userId', userId) : -1;
  }
  return ( gameUserIndex > -1 ) ? game.users[gameUserIndex] : null;
}

ggGame.getGameUsersInfo =function(userGames) {
  // Get users
  var userIds =[];
  userGames.forEach(function(user) {
    userIds.push(user.userId);
  });
  return Meteor.users.find({ _id: { $in:userIds } }, { fields: { profile:1, username:1 } }).fetch();
};

ggGame.getUserGames =function(userId) {
  if(!userId) {
    return [];
  }
  var userGames =(userId && UserGamesCollection.find({ userId:userId }).fetch() ) || null;
  var gameIds =[];
  if(userGames) {
    userGames.forEach(function(ug) {
      gameIds.push(ug.gameId);
    });
  }
  var games =( (gameIds.length >0) && GamesCollection.find({ _id: { $in: gameIds } }).fetch() ) || null;
  var gameRuleIds =[];
  if(games) {
    games.forEach(function(game) {
      gameRuleIds.push(game.gameRuleId)
    });
    var gameRules =GameRulesCollection.find({ _id: { $in: gameRuleIds } }).fetch();
  }

  if(!userGames) {
    return [];
  }
  var game, gameRule, gameIndex, gameRuleIndex, gameEnd;
  return _.sortByOrder(userGames.map(function(ug) {
    gameIndex =_.findIndex(games, '_id', ug.gameId);
    game =(gameIndex >-1) ? games[gameIndex] : null;
    gameRuleIndex = game ? _.findIndex(gameRules, '_id', game.gameRuleId) : -1;
    gameRule =(gameRuleIndex >-1) ? gameRules[gameRuleIndex] : null;
    gameEnd = (game && gameRule) ? ggGame.getGameEnd(game, gameRule) : null;
    return {
      numChallenges: (ug.challenges && ug.challenges.length) || 0,
      gameStart: game ? game.start : null,
      gameEnd: gameEnd,
      game: {
        slug: game ? game.slug : null,
        title: game ? game.title : null
      }
    };
  }), ['gameStart'], ['asc']);
};

ggGame.getUserGameChallenges =function(gameId, userId) {
  if(!gameId || !userId) {
    return [];
  }
  var userGame =ggGame.getUserGame(gameId, userId);
  if(!userGame || !userGame.challenges) {
    return [];
  }
  return _.sortByOrder(userGame.challenges.map(function(challenge, index) {
    return _.extend({}, challenge, {
      xDisplay: {
        updatedAt: moment(challenge.updatedAt, ggConstants.dateTimeFormat).fromNow()
      },
      // VERY IMPORTANT to preserve the database index for updates since we are sorting
      // TODO - should update by id instead so order does not matter
      _xIndex: index
    });
  }), ['updatedAt'], ['desc']);
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

  var challenges =_.sortByOrder(userGame.challenges, ['updatedAt'], ['asc']);
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
ggGame.getUserGamesChallenges =function(userGames, game, users) {
  var userIndex, curUser, gameUserIndex, buddyId, buddyIndex;

  // The first time we won't know all the buddy action totals so we
  // just save the buddy id for a second pass through.
  var users1 =[];
  userGames.forEach(function(ug) {
    // Reset
    curUser ={
      numActions: 0,
      numChallenges: 0,
      buddyId: null,
      info: {}
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
  }
  userGames.forEach(function(ug) {
    if(curChallenge.possibleCompletions) {
      if(ug.challenges && ug.challenges.length) {
        ret.userCompletions +=ug.challenges.length;
        ug.challenges.forEach(function(c) {
          if(c.actionCount) {
            ret.userActions +=c.actionCount;
          }
        });
      }
    }
    // get user goal
    userGameIndex =_.findIndex(game.users, 'userId', ug.userId);
    if(userGameIndex >-1 && game.users[userGameIndex].selfGoal) {
      ret.userGoals +=game.users[userGameIndex].selfGoal;
    }
  });
  return ret;
};

/**
Get all the challenges for the game and stuff in the current user's results
for each.
If no userGame, just returns the challenges with a formated time display.
*/
ggGame.getChallengesWithUser =function(game, gameRule, userGame, nowTime) {
  nowTime =nowTime || moment();
  var ret ={
    challenges: []
  };
  if(!game || !gameRule || !gameRule.challenges) {
    return ret;
  }

  var userId =userGame ? userGame.userId : null;
  var gameUser =userGame ? ggGame.getGameUser(game, userId, {}) : null;
  var userSelfGoalPerChallenge =userGame
   ? Math.ceil( gameUser.selfGoal / gameRule.challenges.length ) : 0;
  var userMayViewChallenges =userGame
   ? ggMay.viewUserGameChallenge(game, userId) : false;

  var gameStart =moment(game.start, ggConstants.dateTimeFormat);
  // Sort both game challenges and user completed challenges by date
  var challenges =_.sortByOrder(gameRule.challenges, ['dueFromStart'], ['asc']);
  var userChallenges =( !userGame || !userGame.challenges ) ? []
   : _.sortByOrder(userGame.challenges, ['updatedAt'], ['asc']);

  var curChallenge, curChallengeEnd, ii, ucUpdated, uc;
  var challengeEnded, challengeStarted;
  var lastChallengeEnd =gameStart;
  challenges.forEach(function(challenge) {
    curChallengeEnd =gameStart.clone().add(challenge.dueFromStart, 'minutes');
    challengeEnded = ( curChallengeEnd <= nowTime ) ? true : false;
    challengeStarted =( lastChallengeEnd <= nowTime ) ? true : false;
    curChallenge ={
      title: challenge.title,
      description: challenge.description,
      start: lastChallengeEnd.format(ggConstants.dateTimeFormat),
      end: curChallengeEnd.format(ggConstants.dateTimeFormat),
      // If challenge has not started, show when it does. If it has started
      // but has NOT ended, show when it ends. If it's already over, show
      // when it ended.
      timePeriod: ( !challengeStarted ) ? 'future'
       : ( challengeStarted && !challengeEnded ) ? 'present' : 'past',
      timeDisplay: ( !challengeStarted) ? ( "Starts " + lastChallengeEnd.from(nowTime) )
       : ( challengeStarted && !challengeEnded) ? ( "Ends " + curChallengeEnd.from(nowTime) )
       : ( "Ended " + curChallengeEnd.from(nowTime) ),
      userSelfGoal: userSelfGoalPerChallenge,
      userActionCount: 0,    // May be updated
      // May update if this is the current challenge
      mayUpdate: ( userMayViewChallenges && nowTime >= lastChallengeEnd &&
       nowTime <= curChallengeEnd ) ? true : false,
      instruction: "Do " + ( ( userSelfGoalPerChallenge > 0 )
       ? userSelfGoalPerChallenge : "??" ) + " " + gameRule.mainAction   // May be updated
    };

    if(userGame) {
      // Get user action count for this challenge (if there is one)
      for(ii =0; ii<userChallenges.length; ii++) {
        uc =userChallenges[ii];
        ucUpdated =moment(uc.updatedAt, ggConstants.dateTimeFormat);
        // If updated between start and end of this challenge, this is it.
        if( ucUpdated >= lastChallengeEnd && ucUpdated <= curChallengeEnd ) {
          curChallenge.userActionCount =uc.actionCount;
          // Update instruction
          curChallenge.instruction = ( ( challengeEnded ) ? ( "You did" ) :
           ( "You've done" ) ) + " " + uc.actionCount + " / " + userSelfGoalPerChallenge + " " +
           gameRule.mainAction;
          break;
        }
        // If updated after this challenge ended, we're already too far, stop
        // (user did NOT complete this challenge).
        else if( ucUpdated > curChallengeEnd ) {
          break;
        }
        // Otherwise (if updated before start), move on to next one
      }
    }

    ret.challenges.push(curChallenge);

    lastChallengeEnd =curChallengeEnd;
  });

  return ret;
}