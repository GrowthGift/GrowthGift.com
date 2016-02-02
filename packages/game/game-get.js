ggGame.getImage =function(game) {
  return game.image ? game.image
   : ggUrls.img('games')+'playful-beach.jpg';
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
    gameEnd = (game) ? game.end : null;
    return {
      numChallenges: (ug.challenges && ug.challenges.length) || 0,
      gameStart: game ? game.start : null,
      gameEnd: gameEnd,
      game: {
        slug: game ? game.slug : null,
        title: game ? game.title : null,
        image: game ? game.image : null
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
  return userGame.challenges;
};

ggGame.getGameState =function(game, gameRule, nowTime) {
  if(!game || ( !game.end && ( !gameRule || !gameRule.challenges ) ) ) {
    return null;
  }

  nowTime =nowTime || msTimezone.curDateTime('moment');
  var gameStart =moment(game.start, msTimezone.dateTimeFormat).utc();
  if(game.end) {
    gameEnd =moment(game.end, msTimezone.dateTimeFormat);
  }
  else {
    // Assume in order with the last due date as the last item in the array
    var lastChallenge =gameRule.challenges[(gameRule.challenges.length-1)];
    var gameEnd =gameStart.clone().add(lastChallenge.dueFromStart, 'minutes');
  }
  return {
    gameStarted: ( gameStart <= nowTime ) ? true : false,
    gameEnded: ( gameEnd < nowTime ) ? true : false,
    starts: gameStart.format(msTimezone.dateTimeFormat),
    ends: gameEnd.format(msTimezone.dateTimeFormat)
  };
};

ggGame.getGameEnd =function(game, gameRule) {
  if(!game || ( !game.end && ( !gameRule || !gameRule.challenges ) ) ) {
    return null;
  }
  if(!game.numWeeks) {
    game.numWeeks =1;
  }

  if(game.end) {
    return game.end;
  }
  var gameStart =moment(game.start, msTimezone.dateTimeFormat).utc();
  // Assume in order with the last due date as the last item in the array
  var lastChallenge =gameRule.challenges[(gameRule.challenges.length-1)];
  var dueFromStart =ggGame.getChallengeDueByWeek(lastChallenge, ( game.numWeeks -1 ) );
  return gameStart.clone().add(dueFromStart,
   'minutes').format(msTimezone.dateTimeFormat);
};

_ggGame.getGameUsersStatsData =function(userGames, game, users, gameRule, nowTime) {
  if(!gameRule || !gameRule.challenges || !gameRule.challenges.length) {
    return [];
  }
  nowTime =nowTime || msTimezone.curDateTime('moment');
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
      numCompletions: (ug && ug.challenges) ? ug.challenges.length : 0,
      possibleCompletions: possibleCompletions,
      completionPercent: 0,
      pledgePercent: 0,
      numChallenges: 0,
      info: {},
      buddyId: null,
      reachTeamUserIds: []
    };
    curUser.completionPercent = (curUser.possibleCompletions >0) ?
     Math.round(curUser.numCompletions / curUser.possibleCompletions * 100) : 0;

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
          _id: (Math.random() + 1).toString(36).substring(7),
          buddiedPledgePercent: 0,
          buddiedNumCompletions: u.numCompletions,
          buddiedPossibleCompletions: u.possibleCompletions,
          buddiedCompletionPercent: (u.possibleCompletions >0) ?
           Math.round(u.numCompletions / u.possibleCompletions * 100) : 0,
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
          curBuddyUser.buddiedNumCompletions += buddyUser.numCompletions;
          curBuddyUser.buddiedPossibleCompletions += buddyUser.possibleCompletions;
          curBuddyUser.buddiedCompletionPercent = (curBuddyUser.buddiedPossibleCompletions >0) ?
           Math.round(curBuddyUser.buddiedNumCompletions / curBuddyUser.buddiedPossibleCompletions * 100) : 0;
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
    _id: (Math.random() + 1).toString(36).substring(7),
    buddiedPledgePercent: 0,
    buddiedNumCompletions: 0,
    buddiedPossibleCompletions: 0,
    buddiedCompletionPercent: 0,
    buddiedReachTeamsNumActions: 0,
    buddiedTeamSize: 1,    // self
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
  retUser.buddiedNumCompletions +=user.numCompletions;
  retUser.buddiedPossibleCompletions +=user.possibleCompletions;
  retUser.buddiedCompletionPercent = (retUser.buddiedPossibleCompletions >0) ?
   Math.round(retUser.buddiedNumCompletions / retUser.buddiedPossibleCompletions * 100) : 0;
  var buddyIndex =_.findIndex(users1, 'info._id', user.buddyId);
  if(buddyIndex >-1) {
    retUser.buddiedTeamSize++;
    var buddyUser =users1[buddyIndex];
    retUser.buddiedNumCompletions +=buddyUser.numCompletions;
    retUser.buddiedPossibleCompletions +=buddyUser.possibleCompletions;
    retUser.buddiedCompletionPercent = (retUser.buddiedPossibleCompletions >0) ?
     Math.round(retUser.buddiedNumCompletions / retUser.buddiedPossibleCompletions * 100) : 0;
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
      retUser.buddiedTeamSize++;
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
        retUser.buddiedTeamSize++;
      }
    });
  }

  return retUser;
};

ggGame.userInGame =function(game, userId) {
  if(!game || !userId) {
    return false;
  }
  var gameUser =ggGame.getGameUser(game, userId, {});
  return ( gameUser && gameUser.status ==='joined' ) ? true : false;
};

ggGame.getGameUserBuddyId =function(game, userId) {
  if(!game || !userId) {
    return null;
  }
  var gameUser =ggGame.getGameUser(game, userId, {});
  return gameUser ? gameUser.buddyId : null;
};