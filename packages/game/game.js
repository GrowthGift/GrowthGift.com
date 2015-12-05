ggGame.save =function(gameDoc, gameDocId, userId, callback) {
  var valid =true;
  if(gameDocId) {
    var game =GamesCollection.findOne({_id: gameDocId});
    valid =ggMay.editGame(game, userId);
  }
  var slug =(gameDoc.$set && gameDoc.$set.slug) || gameDoc.slug;
  if(slug) {
    var existingDoc =(gameDocId && ({_id: gameDocId})) || null;
    var slugExists =ggSlug.exists(slug, 'games', existingDoc, null);
    if(slugExists) {
      valid =false;
    }
  }

  if(!valid) {
    if(Meteor.isClient) {
      nrAlert.alert("Only game admins may edit games.");
    }
  }
  else {
    if(gameDocId) {
      var modifier =gameDoc;
      GamesCollection.update({_id:gameDocId}, modifier, callback);
    }
    else {
      GameSchema.clean(gameDoc);
      if(userId) {
        gameDoc.users =[
          {
            userId: userId,
            role: 'creator',
            status: 'joined',
            updatedAt: ggConstants.curDateTime()
          }
        ];
      }
      var gameId =GamesCollection.insert(gameDoc, callback);

      // On insert, need to add to user games collection too
      var doc ={
        userId: userId,
        gameId: gameId
      };
      UserGamesCollection.insert(doc, function(err, result) {
        // console.info('ggGame.save UserGamesCollection.insert', doc, err, result);
      });
    }
  }
};

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