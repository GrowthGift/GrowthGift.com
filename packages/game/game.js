ggGame ={};

ggGame.join =function(game, userId, callback) {
  var valid =ggMay.joinGame(game, userId);
  if(!valid) {
    if(Meteor.isClient) {
      nrAlert.alert("You may not join this game.");
    }
  }
  else {
    var userGame =ggGame.getUserGame(game._id, userId);
    if(userGame) {
      callback(null, {});
    }
    else {
      var doc ={
        userId: userId,
        gameId: game._id
      };
      UserGamesCollection.insert(doc, function(err, result) {
        // console.info('ggGame.join UserGamesCollection.insert', doc, err, result);
      });

      // Add to game.users as well
      var game =GamesCollection.findOne({ _id:game._id }, { fields: { users:1 } });
      var userIndex =_.findIndex(game.users, 'userId', userId);
      if(userIndex >=0) {
        callback(null, {});
      }
      else {
        var userObj ={
          userId: userId,
          status: 'joined',
          updatedAt: ggConstants.curDateTime()
        };
        var modifier ={
          $push: {
            users: {
              $each: [ userObj ]
            }
          }
        };
        GamesCollection.update({ _id:game._id }, modifier, callback);
      }
    }
  }
};

ggGame.getUserGame =function(gameId, userId) {
  return UserGamesCollection.findOne({gameId: gameId, userId: userId});
};

ggGame.leave =function(game, userId, callback) {
  var valid =ggMay.leaveGame(game, userId);
  if(!valid) {
    if(Meteor.isClient) {
      nrAlert.alert("You may not leave this game.");
    }
  }
  else {
    UserGamesCollection.remove({ gameId:game._id, userId:userId }, function(err, result) {
      // console.info('ggGame.leave UserGamesCollection.remove', game._id, userId, err, result);
    });

    // Remove from game.users as well
    var modifier ={
      $pull: {
        users: {
          userId: {
            $in: [ userId ]
          }
        }
      }
    };
    GamesCollection.update({ _id:game._id }, modifier, callback);
  }
};