ggMay ={};

_may ={};

_may.getUserAdminIds =function(users) {
  if(!users) {
    return [];
  }
  return userAdminIds =users.map(function(user) {
    return (user.role && user.role ==='creator' || user.role ==='admin') ? user.userId : false;
  });
}

_may.getUserCreatorIds =function(users) {
  if(!users) {
    return [];
  }
  return userAdminIds =users.map(function(user) {
    return (user.role && user.role ==='creator') ? user.userId : false;
  });
}

_may.isUserAdmin =function(users, userId) {
  return (_may.getUserAdminIds(users).indexOf(userId) >-1) ? true : false;
};

_may.isUserCreator =function(users, userId) {
  return (_may.getUserCreatorIds(users).indexOf(userId) >-1) ? true : false;
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
}

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