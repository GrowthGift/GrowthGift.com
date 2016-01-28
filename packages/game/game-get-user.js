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
Returns the current challenge IF the user has completed it. Null otherwise.
*/
ggGame.getUserActiveChallenge =function(userGame, game, gameRule, nowTime) {
  var challenge =null;
  if(!userGame || !userGame.challenges || !game || !gameRule) {
    return challenge;
  }
  var curChallenge =ggGame.getCurrentChallenge(game, gameRule, nowTime)
   .currentChallenge;
  var lastUserChallenge =ggGame.getCurrentUserChallenge(game._id,
   userGame.userId, userGame).mostRecentChallenge;

  var dtFormat =msTimezone.dateTimeFormat;
  var userUpdated =moment(lastUserChallenge.updatedAt, dtFormat).utc();
  if(curChallenge && lastUserChallenge &&
   ( userUpdated >= moment(curChallenge.start, dtFormat).utc() ) &&
   ( userUpdated <= moment(curChallenge.end, dtFormat).utc() ) ) {
    challenge =lastUserChallenge;
  }
  return challenge;
};

ggGame.getUserGamePastTotalActions =function(userGame, game, gameRule, nowTime) {
  var totalActions =ggGame.getUserGameTotalActions(userGame);
  var userActiveChallenge =ggGame.getUserActiveChallenge(userGame, game,
   gameRule, nowTime);
  if(userActiveChallenge && userActiveChallenge.actionCount) {
    totalActions -= userActiveChallenge.actionCount;
  }
  return totalActions;
};

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

ggGame.getUserChallengesByWeek =function(users, userId, userGames, userGamesBuddy, games, gameRules, gamesVisible) {
  var gameUser, gameUserIndex, buddyId;
  var userMainIndex = _.findIndex(users, '_id', userId);
  var userMain = users[userMainIndex];

  var challengesByWeek =[];
  var gameIndex, game, gameRuleIndex, gameRule;
  var userBuddyIndex, userBuddy;
  var userGameBuddyIndex, userGameBuddy;
  var challenges, links;
  var curItem;
  userGames.forEach(function(userGame) {
    // See if we want to load this game. Default to false.
    if(gamesVisible[userGame.gameId] === undefined) {
      gamesVisible[userGame.gameId] =false;
    }

    gameIndex = _.findIndex(games, '_id', userGame.gameId);
    game = ( gameIndex > -1 ) ? games[gameIndex] : null;
    gameRuleIndex = game ? _.findIndex(gameRules, '_id', game.gameRuleId)
     : -1;
    gameRule = ( gameRuleIndex > -1 ) ? gameRules[gameRuleIndex] : null;
    // console.log(userGame, game);
    if(game && gameRule) {
      var curItem ={
        gameId: userGame.gameId,
        gameStart: game.start,
        gameTitle: game.title,
        xVisible: false
      };

      if( gamesVisible[userGame.gameId] ) {
        // Get buddy user id, if exists.
        gameUserIndex =_.findIndex(game.users, 'userId', userId);
        gameUser = ( gameUserIndex > -1 ) ? game.users[gameUserIndex] : null;
        buddyId = gameUser && gameUser.buddyId || null;
        userBuddyIndex = buddyId ? _.findIndex(users, '_id', buddyId) : null;
        userBuddy = ( userBuddyIndex > -1 ) ? users[userBuddyIndex] : null;

        userGameBuddyIndex =buddyId ?
         _.findIndex(userGamesBuddy, 'userId', buddyId) : -1;
        userGameBuddy = ( userGameBuddyIndex > -1 ) ?
         userGamesBuddy[userGameBuddyIndex] : null;

        challenges =ggGame.getUserChallengeLog(game, gameRule, userGame,
         null, userGameBuddy, Meteor.user(), userMain, userBuddy);

        links ={
          game: ggUrls.game(game.slug),
          gameUsers: ggUrls.gameUsers(game.slug),
          userMain: ggUrls.user(userMain.username),
          userBuddy: userBuddy ? ggUrls.user(userBuddy.username) : null,
        };

        curItem.userMain = userMain;
        curItem.userBuddy = userBuddy;
        curItem.gameMainAction = gameRule.mainAction;
        curItem.links = links;
        curItem.challenges = challenges;
        curItem.xVisible = true;
      }

      challengesByWeek.push(curItem);
    }
  });

  // Sort by game start
  challengesByWeek =_.sortByOrder(challengesByWeek, ['gameStart'], ['desc']);
  return {
    challengesByWeek: challengesByWeek,
    gamesVisible: gamesVisible
  };
};