ggMay ={};

_may ={};

_may.getUserAdminIds =function(users) {
  if(!users) {
    return [];
  }
  return users.map(function(user) {
    return (user.role && user.role ==='creator' || user.role ==='admin') ? user.userId : false;
  });
}

_may.getUserCreatorIds =function(users) {
  if(!users) {
    return [];
  }
  return users.map(function(user) {
    return (user.role && user.role ==='creator') ? user.userId : false;
  });
}

_may.getUser =function(users, userId) {
  if(!users || !userId) {
    return {};
  }
  return users.filter(function(user) {
    return (user.userId ===userId) ? true : false;
  });
};

_may.getUserStatus =function(users, userId) {
  if(!users || !userId) {
    return null;
  }
  return _may.getUser(users, userId).map(function(user) {
    return user.status;
  })[0];    //[0] because only want 1 user status, not an array
};

_may.isUserAdmin =function(users, userId) {
  return (userId && _may.getUserAdminIds(users).indexOf(userId) >-1) ? true : false;
};

_may.isUserCreator =function(users, userId) {
  return (userId && _may.getUserCreatorIds(users).indexOf(userId) >-1) ? true : false;
};

ggMay.editGame =function(game, userId) {
  if(!userId) {
    return false;
  }
  // Any user can create a new game
  if(!game || !game._id) {
    return true;
  }
  return _may.isUserAdmin(game.users, userId);
};

ggMay.deleteGame =function(game, userId) {
  if(!userId || !game || !game._id) {
    return false;
  }
  return _may.isUserCreator(game.users, userId);
};

ggMay.joinGame =function(game, userId) {
  var status =_may.getUserStatus(game.users, userId);
  return (!status || (status !=='joined' && status !=='blocked' &&
   status !=='requested') ) ? true : false;
};

ggMay.leaveGame =function(game, userId) {
  var status =_may.getUserStatus(game.users, userId);
  // May leave if joined and not a creator
  return (status && (status ==='joined') && !_may.isUserCreator(game.users, userId) )
   ? true : false;
};

/**
TODO - DRY up - this is copied from ggGame
*/
_may.getGameUser =function(game, userId, params) {
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

ggMay.beGameBuddy =function(game, buddyUserId, buddyRequestKey) {
  if(!game || ( !buddyUserId && !buddyRequestKey ) ) {
    return false;
  }
  var gameUserSelf =( buddyUserId ) ? _may.getGameUser(game, buddyUserId, {}) : null;
  var gameUserBuddy =_may.getGameUser(game, null, { buddyRequestKey: buddyRequestKey });
  // If potential buddy does NOT already have a buddy and the request keys
  // match, then can be a buddy.
  if( gameUserBuddy && !gameUserBuddy.buddyId && ( !gameUserSelf || (
   !gameUserSelf.buddyId && gameUserSelf.userId !== gameUserBuddy.userId ) )
   && gameUserBuddy.buddyRequestKey && ( gameUserBuddy.buddyRequestKey ===
   buddyRequestKey) ) {
    return true;
  }
  return false;
};

ggMay.editGameRule =function(gameRule, userId) {
  if(!userId) {
    return false;
  }
  // Any user can create a new game
  if(!gameRule || !gameRule._id) {
    return true;
  }
  return _may.isUserAdmin(gameRule.users, userId);
};

ggMay.viewUserGameChallenge =function(game, userId) {
  if(!game || !userId) {
    return false;
  }
  // User must be in game
  var status =_may.getUserStatus(game.users, userId);
  if(!status || status !=='joined') {
    return false;
  }
  return true;
};

ggMay.addUserGameChallenge =function(game, userId, curChallenge, userChallenge, nowTime) {
  nowTime =nowTime || moment();
  if(!game || !userId || !ggMay.viewUserGameChallenge(game, userId)) {
    return false;
  }

  // User can only add one challenge completion per challenge (time period)
  // If game has not started or is already over, can not add a challenge
  if(!curChallenge.gameStarted || curChallenge.gameEnded || !curChallenge.currentChallenge) {
    return false;
  }

  // Only may add if the user has NOT completed a challenge yet OR the user
  // most recent challenge completion happened BEFORE the current challenge start
  if(!userChallenge.mostRecentChallenge || moment(userChallenge.mostRecentChallenge.updatedAt, msTimezone.dateTimeFormat)
   < moment(curChallenge.currentChallenge.start, msTimezone.dateTimeFormat) ) {
    return true;
  }
  return false;
};

/**
May edit an individual challenge up until the due date
*/
ggMay.editUserGameChallenge =function(gameCurrentChallenge, challenge) {
  if(!gameCurrentChallenge || !challenge) {
    return false;
  }

  var dtFormat =msTimezone.dateTimeFormat;
  // Only may edit if the challenge was added after the game current challenge
  // start but before the game current challenge end.
  var challengeCreatedMoment =moment(challenge.updatedAt, dtFormat);
  if(challengeCreatedMoment > moment(gameCurrentChallenge.start, dtFormat)
   && challengeCreatedMoment < moment(gameCurrentChallenge.end, dtFormat) ) {
    return true;
  }
  return false;
};