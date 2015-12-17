ggGame.getUserGame =function(gameId, userId) {
  return UserGamesCollection.findOne({gameId: gameId, userId: userId});
};

ggGame.getUserGameTotalActions =function(userGame) {
  var numActions =0;
  if(!userGame || !userGame.challenges) {
    return numActions;
  }
  userGame.challenges.forEach(function(c) {
    if(c.actionCount) {
      numActions += c.actionCount;
    }
  });
  return numActions;
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
  if(!userGames) {
    return [];
  }
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
  return userGames.map(function(ug) {
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
  });
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
        updatedAt: moment(challenge.updatedAt, msTimezone.dateTimeFormat).fromNow()
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
  var dtFormat =msTimezone.dateTimeFormat;

  var gameStart =moment(game.start, dtFormat);
  if(gameStart >nowTime) {
    ret.nextChallenge =_.extend({}, gameRule.challenges[0], {
      start: gameStart.format(dtFormat),
      end: gameStart.clone().add(gameRule.challenges[0].dueFromStart, 'minutes').format(dtFormat)
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
        start: lastChallengeDue.format(dtFormat),
        end: curChallengeDue.format(dtFormat)
      });
      ret.possibleCompletions =(ii+1);
      if(ii <(gameRule.challenges.length-1) ) {
        ret.nextChallenge =_.extend({}, gameRule.challenges[(ii+1)], {
          start: ret.currentChallenge.end,
          end: gameStart.clone().add(gameRule.challenges[(ii+1)].dueFromStart, 'minutes').format(dtFormat)
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

ggGame.getGameState =function(game, gameRule, nowTime) {
  if(!game || !gameRule || !gameRule.challenges) {
    return null;
  }

  nowTime =nowTime || moment();
  var gameStart =moment(game.start, msTimezone.dateTimeFormat);
  // Assume in order with the last due date as the last item in the array
  var lastChallenge =gameRule.challenges[(gameRule.challenges.length-1)];
  var gameEnd =gameStart.clone().add(lastChallenge.dueFromStart, 'minutes');
  return {
    gameStarted: ( gameStart <= nowTime ) ? true : false,
    gameEnded: ( gameEnd < nowTime ) ? true : false,
    starts: gameStart.format(msTimezone.dateTimeDisplay),
    ends: gameEnd.format(msTimezone.dateTimeDisplay)
  };
};

ggGame.getGameEnd =function(game, gameRule) {
  if(!game || !gameRule || !gameRule.challenges) {
    return null;
  }

  var gameStart =moment(game.start, msTimezone.dateTimeFormat);
  // Assume in order with the last due date as the last item in the array
  var lastChallenge =gameRule.challenges[(gameRule.challenges.length-1)];
  return gameStart.clone().add(lastChallenge.dueFromStart,
   'minutes').format(msTimezone.dateTimeFormat);
}

ggGame.getGameTimeLeft =function(game, gameRule) {
  if(!game || !gameRule || !gameRule.challenges) {
    return null;
  }
  var ret ={
    amount: -1,
    unit: 'days'
  };

  var gameStart =moment(game.start, msTimezone.dateTimeFormat);
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

_ggGame.getGameUsersStatsData =function(userGames, game, users, gameRule, nowTime) {
  if(!gameRule || !gameRule.challenges || !gameRule.challenges.length) {
    return [];
  }
  nowTime =nowTime || moment();
  var userIndex, curUser, gameUserIndex, gameUser, buddyId, buddyIndex;

  // Figure out total possible completions for calculating pledge percent.
  var possibleCompletions =
   ggGame.getCurrentChallenge(game, gameRule, nowTime).possibleCompletions;
  var completionRatio = ( possibleCompletions / gameRule.challenges.length );

  // The first time we won't know all the buddy action totals so we
  // just save the buddy id for a second pass through.
  var users1 =[];
  userGames.forEach(function(ug) {
    // Reset
    curUser ={
      numActions: 0,
      pledgePercent: 0,
      numChallenges: 0,
      info: {},
      buddyId: null,
      reachTeamUserIds: []
    };

    // Get buddy id for later
    gameUserIndex =game.users ? _.findIndex(game.users, 'userId', ug.userId)
     : -1;
    gameUser =( gameUserIndex >-1 ) ? game.users[gameUserIndex] : null;
    buddyId =( gameUser ) ? gameUser.buddyId : null;
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
    if(gameUser && gameUser.selfGoal) {
      curUser.pledgePercent = Math.round( curUser.numActions /
       ( completionRatio * gameUser.selfGoal ) * 100);
    }

    if(gameUser && gameUser.reachTeam && gameUser.reachTeam.length) {
      curUser.reachTeamUserIds =gameUser.reachTeam.map(function(rt) {
        return rt.userId;
      });
    }

    users1.push(curUser);
  });
  return users1;
};

/**
This joins buddies together for their total pledge percent and total reach
 score, which is the sum of theirs, their buddy's, their reach team, and
 their buddy's reach team. This thus returns LESS (down to only 1/2 if all
 users are buddied) user teams than the original `userGames` input.
The pledge percentage is the number of actions divided by possible
 completions. This and reach team actions require the `game` and `gameRule`
 parameters.

Performance note: This requires a LOT of loops through the same data. First
 we get all actions and pledge percents for each user, then have to go back
 through to find and add in both buddy and reach team amounts (for both self
 and buddy) too.
*/
ggGame.getGameUsersStats =function(userGames, game, users, gameRule, nowTime) {
  var users1 =_ggGame.getGameUsersStatsData(userGames, game, users, gameRule, nowTime);

  // Fill buddy and reach team actions.
  // And group buddies together as one return item.
  var buddyUsers =[], alreadyBuddied, curBuddyUser;
  var buddyUser, reachIndex, buddyIndex;
  users1.forEach(function(u) {
    if(u.info) {
      // Only need to check user2 since will always put user1 as self. So the
      // only way to already have been buddied is if this user is user2.
      alreadyBuddied =( _.findIndex(buddyUsers, 'user2._id', u.info._id) >-1 )
       ? true : false;
      // Only add if buddy has not already been added for them
      if(!alreadyBuddied) {
        curBuddyUser ={
          buddiedPledgePercent: 0,
          buddiedReachTeamsNumActions: 0,
          buddiedTeamSize: 1,    // self
          user1: u.info,
          user2: {}
        };

        buddyIndex =_.findIndex(users1, 'info._id', u.buddyId);
        if(buddyIndex >-1) {
          curBuddyUser.buddiedTeamSize++;
          buddyUser =users1[buddyIndex];
          // u.buddyNumActions =buddyUser.numActions;
          curBuddyUser.buddiedPledgePercent =Math.round ( ( u.pledgePercent +
           buddyUser.pledgePercent ) / 2 );
          curBuddyUser.user2 =buddyUser.info;
        }
        else {
          // For now we will just get the user the full solo percent, but should
          // probably denote (asterisk) it in the display.
          curBuddyUser.buddiedPledgePercent =u.pledgePercent;
        }

        // Do reach team
        // Add self actions.
        curBuddyUser.buddiedReachTeamsNumActions +=u.numActions;
        u.reachTeamUserIds.forEach(function(id) {
          reachIndex =_.findIndex(users1, 'info._id', id);
          if(reachIndex >-1) {
            curBuddyUser.buddiedTeamSize++;
            curBuddyUser.buddiedReachTeamsNumActions += users1[reachIndex].numActions;
          }
        });
        // Add buddy's reach teach too
        if(buddyIndex >-1) {
          // Add buddy actions.
          curBuddyUser.buddiedReachTeamsNumActions +=buddyUser.numActions;
          buddyUser.reachTeamUserIds.forEach(function(id) {
            reachIndex =_.findIndex(users1, 'info._id', id);
            if(reachIndex >-1) {
              curBuddyUser.buddiedTeamSize++;
              curBuddyUser.buddiedReachTeamsNumActions += users1[reachIndex].numActions;
            }
          });
        }

        buddyUsers.push(curBuddyUser);
      }
    }
  });
  return buddyUsers;
};

/**
This is just like the plural (multiple users) version but for just one user.
Basically it just breaks out the reach team actions into 4 categories and
 shows the details (the reach user, pledge percent, and number of actions).
For performance reasons, you should pass in ONLY the userGames (and users)
 relevant to this one user (that user, the user's buddy, and the user's reach
 team).
*/
ggGame.getGameUserStats =function(userGames, game, users, gameRule, userId, nowTime) {
  var users1 =_ggGame.getGameUsersStatsData(userGames, game, users, gameRule, nowTime);

  var retUser ={
    buddiedPledgePercent: 0,
    buddiedReachTeamsNumActions: 0,
    numActionsTotals: {
      selfReach: 0,
      buddyReach: 0
    },
    selfUser: null,
    buddyUser: null,
    selfReachUsers: [],
    buddyReachUsers: []
  };
  // Fill buddy and reach team actions
  var userIndex =_.findIndex(users1, 'info._id', userId);
  if(userIndex <0) {
    return retUser;
  }
  var user =users1[userIndex];
  retUser.selfUser =user;
  var buddyIndex =_.findIndex(users1, 'info._id', user.buddyId);
  if(buddyIndex >-1) {
    var buddyUser =users1[buddyIndex];
    retUser.buddiedPledgePercent =Math.round ( ( user.pledgePercent +
     buddyUser.pledgePercent ) / 2 );
    retUser.buddyUser =buddyUser;
  }
  else {
    // For now we will just get the user the full solo percent, but should
    // probably denote (asterisk) it in the display.
    retUser.buddiedPledgePercent =user.pledgePercent;
  }

  // Do reach team
  var reachIndex, reachUser;
  // Add self actions.
  retUser.buddiedReachTeamsNumActions +=user.numActions;
  user.reachTeamUserIds.forEach(function(id) {
    reachIndex =_.findIndex(users1, 'info._id', id);
    if(reachIndex >-1) {
      reachUser =users1[reachIndex];
      retUser.buddiedReachTeamsNumActions += reachUser.numActions;
      retUser.numActionsTotals.selfReach += reachUser.numActions;
      retUser.selfReachUsers.push(reachUser);
    }
  });

  // Add buddy's reach teach too
  if(buddyIndex >-1) {
    // Add buddy actions.
    retUser.buddiedReachTeamsNumActions +=buddyUser.numActions;
    buddyUser.reachTeamUserIds.forEach(function(id) {
      reachIndex =_.findIndex(users1, 'info._id', id);
      if(reachIndex >-1) {
        reachUser =users1[reachIndex];
        retUser.buddiedReachTeamsNumActions += reachUser.numActions;
        retUser.numActionsTotals.buddyReach += reachUser.numActions;
        retUser.buddyReachUsers.push(reachUser);
      }
    });
  }

  return retUser;
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
  var dtFormat =msTimezone.dateTimeFormat;

  var userId =userGame ? userGame.userId : null;
  var gameUser =userGame ? ggGame.getGameUser(game, userId, {}) : null;
  var userSelfGoalPerChallenge =userGame
   ? Math.ceil( gameUser.selfGoal / gameRule.challenges.length ) : 0;
  var userMayViewChallenges =userGame
   ? ggMay.viewUserGameChallenge(game, userId) : false;

  var gameStart =moment(game.start, dtFormat);
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
      start: lastChallengeEnd.format(dtFormat),
      end: curChallengeEnd.format(dtFormat),
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
        ucUpdated =moment(uc.updatedAt, dtFormat);
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