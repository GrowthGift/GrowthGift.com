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