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

ggMay.addUserGameChallenge =function(game, userId, userGame) {
  if(!game || !userId) {
    return false;
  }
  // User must be in game
  var status =_may.getUserStatus(game.users, userId);
  console.log(status, game, userId);
  if(!status || status !=='joined') {
    return false;
  }

  // User can only add one challenge completion per challenge (time period)
  // TODO
  return true;
};