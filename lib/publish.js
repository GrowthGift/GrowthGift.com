if(Meteor.isServer) {
  
  Meteor.publish('users-game-slug', function(gameSlug) {
    var game =(gameSlug && GamesCollection.findOne({slug: gameSlug})) || null;
    var userGames =(game && UserGamesCollection.find({ gameId:game._id }).fetch())
     || null;
    if(game && userGames) {
      var userIds =[];
      userGames.forEach(function(user) {
        userIds.push(user.userId);
      });
      // console.info('users-game-slug: ', Meteor.users.find({ _id: { $in:userIds } }, { fields: { profile:1 } }).fetch());
      return Meteor.users.find({ _id: { $in:userIds } }, { fields: { profile:1 } });
    }
    else {
      this.ready();
      return false;
    }
  });

  Meteor.publish('userGames-userId', function() {
    if(this.userId) {
      return UserGamesCollection.find({ userId:this.userId });
    }
    else {
      this.ready();
      return false;
    }
  });

  Meteor.publish('gameRules-userId', function() {
    var userGames =(this.userId && UserGamesCollection.find({ userId:this.userId }) ) || null;
    var gameIds =[];
    if(userGames) {
      userGames.forEach(function(ug) {
        gameIds.push(ug.gameId);
      });
    }
    var games =( (gameIds.length >0) && GamesCollection.find({ _id: { $in: gameIds } })) || null;
    var gameRuleIds =[];
    if(games) {
      games.forEach(function(game) {
        gameRuleIds.push(game.gameRuleId)
      });
      return GameRulesCollection.find({ _id: { $in: gameRuleIds } });
    }
    else {
      this.ready();
      return false;
    }
  });

  Meteor.publish('games-userId', function() {
    var userGames =(this.userId && UserGamesCollection.find({ userId:this.userId }) ) || null;
    var gameIds =[];
    if(userGames) {
      userGames.forEach(function(ug) {
        gameIds.push(ug.gameId);
      });
      return GamesCollection.find({ _id: { $in: gameIds } });
    }
    else {
      this.ready();
      return false;
    }
  });

}